import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { mockAdminReports, mockResponseTeams } from '@/lib/mock-data';

const execFileAsync = promisify(execFile);

export async function POST(request: NextRequest) {
  let jsonPath = '';
  let pdfPath = '';

  try {
    const body = await request.json().catch(() => ({}));
    const month = body.month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    // Build team map
    const teamMap: Record<string, string> = {};
    mockResponseTeams.forEach((t) => {
      teamMap[t.id] = t.teamName;
    });

    // Build stats
    const pendingCount = mockAdminReports.filter((r) => r.status === 'pending').length;
    const activeCount = mockAdminReports.filter(
      (r) => r.status === 'dispatched' || r.status === 'acknowledged'
    ).length;
    const resolvedCount = mockAdminReports.filter((r) => r.status === 'resolved').length;
    const driverNames = new Set(mockAdminReports.map((r) => r.driver.driverName));

    // Build unique drivers list
    const driverMap = new Map<
      string,
      {
        driverName: string;
        governmentCardPlateNo: string;
        reportCount: number;
        lastLocation: string;
        lastPurpose: string;
        gasoline: {
          balanceInTank: string;
          issuedByOffice: string;
          asPurchased: string;
          deductUsed: string;
          balanceEndTrip: string;
        };
      }
    >();
    mockAdminReports.forEach((r) => {
      if (!driverMap.has(r.driver.driverName)) {
        driverMap.set(r.driver.driverName, {
          driverName: r.driver.driverName,
          governmentCardPlateNo: r.driver.governmentCardPlateNo,
          reportCount: 1,
          lastLocation: r.emergency.location,
          lastPurpose: r.driver.purpose,
          gasoline: r.driver.gasoline,
        });
      } else {
        const entry = driverMap.get(r.driver.driverName)!;
        entry.reportCount += 1;
        entry.lastLocation = r.emergency.location;
        entry.lastPurpose = r.driver.purpose;
        entry.gasoline = r.driver.gasoline;
      }
    });

    const reportData = {
      monthLabel: `${month} Monthly Report`,
      reports: mockAdminReports.map((r) => ({
        id: r.id,
        reportId: r.reportId,
        timestamp: r.timestamp,
        status: r.status,
        priority: r.priority,
        incidentType: r.incidentType,
        assignedTeam: r.assignedTeam || '',
        emergency: {
          timeReported: r.emergency.timeReported,
          timeOfArrival: r.emergency.timeOfArrival,
          date: r.emergency.date,
          location: r.emergency.location,
          patientName: r.emergency.patientName,
          age: r.emergency.age,
          sex: r.emergency.sex,
          address: r.emergency.address,
          typeOfIncident: r.emergency.typeOfIncident,
          allergies: r.emergency.allergies,
          medications: r.emergency.medications,
          assessmentComment: r.emergency.assessmentComment,
          treatmentManagement: r.emergency.treatmentManagement,
          vitalSigns: r.emergency.vitalSigns,
          endorsedBy: r.emergency.endorsedBy,
          endorsedByTime: r.emergency.endorsedByTime,
          endorsedByDate: r.emergency.endorsedByDate,
          endorsedTo: r.emergency.endorsedTo,
          endorsedToTime: r.emergency.endorsedToTime,
          endorsedToDate: r.emergency.endorsedToDate,
        },
        driver: {
          driverName: r.driver.driverName,
          governmentCardPlateNo: r.driver.governmentCardPlateNo,
          authorizedPassenger: r.driver.authorizedPassenger,
          placeVisitedInspected: r.driver.placeVisitedInspected,
          purpose: r.driver.purpose,
          gasoline: r.driver.gasoline,
          passengerName: r.driver.passengerName,
          driverFilledName: r.driver.driverFilledName,
        },
      })),
      drivers: Array.from(driverMap.values()),
      stats: {
        pending: pendingCount,
        active: activeCount,
        resolved: resolvedCount,
        drivers: driverNames.size,
        total: mockAdminReports.length,
      },
      teamMap,
    };

    // Write temp JSON
    const uid = randomUUID();
    const tmpDir = join(tmpdir(), 'mdrrmo-reports');
    await mkdir(tmpDir, { recursive: true });
    jsonPath = join(tmpDir, `report-${uid}.json`);
    pdfPath = join(tmpDir, `report-${uid}.pdf`);

    await writeFile(jsonPath, JSON.stringify(reportData), 'utf-8');

    // Run Python script using the venv Python (which has reportlab)
    const scriptPath = join(process.cwd(), 'scripts', 'generate_monthly_report.py');
    const pythonBin = process.env.PYTHON_PATH || '/home/z/.venv/bin/python3';
    await execFileAsync(pythonBin, [scriptPath, jsonPath, pdfPath], { timeout: 30000 });

    // Read generated PDF
    const pdfBuffer = await readFile(pdfPath);

    // Cleanup temp files
    await unlink(jsonPath).catch(() => {});
    await unlink(pdfPath).catch(() => {});

    // Return PDF
    const filename = `MDRRMO_Monthly_Report_${month.replace(/\s+/g, '_')}.pdf`;
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    // Cleanup on error
    if (jsonPath) await unlink(jsonPath).catch(() => {});
    if (pdfPath) await unlink(pdfPath).catch(() => {});

    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: String(error) },
      { status: 500 }
    );
  }
}
