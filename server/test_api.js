import { randomUUID } from 'crypto';
import app from './app.js';
import db, { connectDB } from './db.js';

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}/api`;

let server;

async function runTests() {
  console.log('🧪 Starting API Tests...');
  let failed = 0;
  let passed = 0;

  const assert = (condition, message) => {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    } else {
      console.log(`✅ PASS: ${message}`);
      passed++;
    }
  };

  try {
    // 1. Test Doctors API
    const doctorsRes = await fetch(`${BASE_URL}/doctors`);
    const doctorsBody = await doctorsRes.json();
    assert(doctorsRes.ok && doctorsBody.success === true && Array.isArray(doctorsBody.data), 'GET /api/doctors should return success and an array of doctors');

    if (doctorsBody.data.length > 0) {
      const docId = doctorsBody.data[0].id;
      const singleDocRes = await fetch(`${BASE_URL}/doctors/${docId}`);
      const singleDocBody = await singleDocRes.json();
      assert(singleDocRes.ok && singleDocBody.success === true && singleDocBody.data.id === docId, 'GET /api/doctors/:id should return specific doctor');
    }

    // 2. Test Medicines API
    const medicinesRes = await fetch(`${BASE_URL}/medicines`);
    const medicinesBody = await medicinesRes.json();
    assert(medicinesRes.ok && medicinesBody.success === true && Array.isArray(medicinesBody.data), 'GET /api/medicines should return success and an array of medicines');

    // 3. Test Patients API
    const testPhone = `999${randomUUID().substring(0, 7)}`;
    const patientPayload = { name: 'Test Patient', phone: testPhone, email: 'test@example.com' };
    const createPatientRes = await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientPayload)
    });
    const createPatientBody = await createPatientRes.json();
    assert(createPatientRes.status === 201 && createPatientBody.success === true && createPatientBody.data.name === 'Test Patient', 'POST /api/patients should create a new patient');

    const getPatientRes = await fetch(`${BASE_URL}/patients?phone=${testPhone}`);
    const getPatientBody = await getPatientRes.json();
    assert(getPatientRes.ok && getPatientBody.success === true && getPatientBody.data.length === 1, 'GET /api/patients should find the created patient');

    // 4. Test Appointments API
    const apptPayload = {
      patientName: 'Test Patient',
      patientPhone: testPhone,
      doctorId: 'gp1',
      date: '2027-01-01',
      slot: '10:00 AM'
    };
    
    // Cleanup any existing conflicting appt for this test
    const dbInstance = await db.getDB();
    await dbInstance.run('DELETE FROM appointments WHERE doctorId = ? AND date = ? AND slot = ?', ['gp1', '2027-01-01', '10:00 AM']);

    const createApptRes = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apptPayload)
    });
    const createApptBody = await createApptRes.json();
    assert(createApptRes.status === 201 && createApptBody.success === true, 'POST /api/appointments should create an appointment');
    
    if (createApptBody.success) {
      const apptId = createApptBody.data.id;
      
      // Patch appointment
      const patchRes = await fetch(`${BASE_URL}/appointments/${apptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      const patchBody = await patchRes.json();
      assert(patchRes.ok && patchBody.success === true && patchBody.data.status === 'completed', 'PATCH /api/appointments/:id should update status');

      // Delete appointment
      const delRes = await fetch(`${BASE_URL}/appointments/${apptId}`, {
        method: 'DELETE'
      });
      const delBody = await delRes.json();
      assert(delRes.ok && delBody.success === true, 'DELETE /api/appointments/:id should soft delete appointment');
      
      // Verify deletion
      const checkDel = await dbInstance.get('SELECT * FROM appointments WHERE id = ?', [apptId]);
      assert(checkDel && checkDel.status === 'cancelled', 'Appointment status should be cancelled in DB');
    }

  } catch (err) {
    console.error('Test execution failed:', err);
    failed++;
  }

  console.log(`\nTest Summary: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

async function main() {
  await connectDB();
  server = app.listen(PORT, async () => {
    const success = await runTests();
    server.close();
    process.exit(success ? 0 : 1);
  });
}

main();
