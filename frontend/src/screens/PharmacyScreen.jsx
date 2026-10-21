import { useState, useEffect } from 'react';
import { Form, Button, Table, Row, Col, Badge, InputGroup, Card, Spinner } from 'react-bootstrap';
import { FaCheck, FaPrint, FaSearch, FaClinicMedical, FaClipboardList } from 'react-icons/fa';
import axios from 'axios';

const PharmacyScreen = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Hämta alla recept
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/prescriptions', { withCredentials: true });
      // Visa företrädesvis aktiva i kön, eller alla med status
      setPrescriptions(data);
    } catch (err) {
      console.error('Fel vid hämtning av receptkö:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Markera recept som uthämtat
  const markAsDispensedHandler = async (id) => {
    try {
      await axios.put(`/api/prescriptions/${id}`, { status: 'Uthämtat' }, { withCredentials: true });
      fetchPrescriptions();
    } catch (err) {
      alert('Kunde inte uppdatera receptstatus.');
    }
  };

  // Skriv ut utlämningskvitto
  const printReceiptHandler = (prescription) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Apotekskvitto - ${prescription.patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 20px; }
            .box { border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin-bottom: 15px; background: #f9f9f9; }
            .label { font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>HOSPITAL APOTEKET</h2>
            <h3>Utlämningskvitto / Receptetikett</h3>
            <p>Datum: ${new Date().toLocaleDateString('sv-SE')}</p>
          </div>
          <div class="box">
            <p><span class="label">Patient:</span> ${prescription.patientName}</p>
            <p><span class="label">Personnummer:</span> ${prescription.patientPersonalId || prescription.personalId}</p>
          </div>
          <div class="box">
            <p><span class="label">Läkemedel:</span> ${prescription.medication}</p>
            <p><span class="label">Dosering:</span> ${prescription.dosage}</p>
            <p><span class="label">Anvisningar:</span> ${prescription.instructions || 'Följ ordinationen på förpackningen'}</p>
            <p><span class="label">Status:</span> UTHÄMTAT</p>
          </div>
          <div class="footer">
            <p>Välkommen åter! För frågor kontakta din behandlande klinik.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Filtrera på aktiv kö (eller sökterm)
  const filteredPrescriptions = prescriptions.filter((p) => {
    const name = p.patientName ? p.patientName.toLowerCase() : '';
    const id = p.patientPersonalId || p.personalId || '';
    const medicationName = p.medication ? p.medication.toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || id.includes(search) || medicationName.includes(search);
  });

  const activeQueueCount = prescriptions.filter((p) => !p.status || p.status === 'Aktivt').length;

  return (
    <div>
      <Row className='align-items-center mb-4'>
        <Col>
          <h2><FaClinicMedical className='me-2 text-success' /> Apotekets Utlämningskö</h2>
          <p className='text-muted mb-0'>Hantera och lämna ut e-recept till patienter</p>
        </Col>
      </Row>

      {/* Statistik / Kö-status */}
      <Row className='mb-4'>
        <Col md={4}>
          <Card bg='light' className='shadow-sm border-success'>
            <Card.Body className='d-flex align-items-center'>
              <FaClipboardList size={30} className='text-success me-3' />
              <div>
                <Card.Title className='fs-6 mb-0 text-muted'>Recept i aktiv kö</Card.Title>
                <Card.Text className='fs-4 fw-bold mb-0'>{activeQueueCount}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <InputGroup className='mb-3'>
        <InputGroup.Text><FaSearch /></InputGroup.Text>
        <Form.Control
          placeholder='Sök på patientnamn, personnummer eller läkemedel...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {loading ? (
        <div className='text-center py-5'>
          <Spinner animation='border' />
        </div>
      ) : (
        <Table striped bordered hover responsive size='sm'>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Personnummer</th>
              <th>Läkemedel</th>
              <th>Dosering</th>
              <th>Status</th>
              <th>Åtgärder (Utlämning)</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrescriptions.length === 0 ? (
              <tr>
                <td colSpan='6' className='text-center py-4'>Inga recept matchade sökningen i kön.</td>
              </tr>
            ) : (
              filteredPrescriptions.map((p) => {
                const pid = p.patientPersonalId || p.personalId;
                const isReady = !p.status || p.status === 'Aktivt';
                return (
                  <tr key={p._id}>
                    <td className='fw-bold'>{p.patientName}</td>
                    <td>{pid}</td>
                    <td>{p.medication}</td>
                    <td>{p.dosage}</td>
                    <td>
                      <Badge bg={p.status === 'Uthämtat' ? 'secondary' : p.status === 'Makulerat' ? 'danger' : 'success'}>
                        {p.status || 'Aktivt'}
                      </Badge>
                    </td>
                    <td>
                      {isReady && (
                        <Button
                          variant='success'
                          size='sm'
                          className='me-2'
                          onClick={() => markAsDispensedHandler(p._id)}
                        >
                          <FaCheck className='me-1' /> Markera Uthämtat
                        </Button>
                      )}
                      <Button
                        variant='outline-secondary'
                        size='sm'
                        onClick={() => printReceiptHandler(p)}
                        title='Skriv ut kvitto / etikett'
                      >
                        <FaPrint className='me-1' /> Kvitto
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default PharmacyScreen;