import { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';

interface TicketPDFProps {
  ticket: {
    id: string;
    quantity: number;
    event: {
      title: string;
      date: Date;
      venue: string;
    };
    transaction: {
      mpesaReceiptNumber?: string;
    };
    user: {
      name: string;
      email: string;
    };
  };
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#6b21a8',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b21a8',
  },
  eventTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 100,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  qrCode: {
    marginTop: 20,
    alignItems: 'center',
  },
  qrImage: {
    width: 150,
    height: 150,
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#666666',
    fontSize: 10,
  },
});

export default function TicketPDF({ ticket }: TicketPDFProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrData = JSON.stringify({
          ticketId: ticket.id,
          eventTitle: ticket.event.title,
          quantity: ticket.quantity,
          mpesaReceipt: ticket.transaction.mpesaReceiptNumber,
        });
        
        const url = await QRCode.toDataURL(qrData);
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [ticket]);

  return (
    <PDFViewer style={{ width: '100%', height: '600px' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Event Ticket</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.eventTitle}>{ticket.event.title}</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>
                {new Date(ticket.event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Venue:</Text>
              <Text style={styles.value}>{ticket.event.venue}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Quantity:</Text>
              <Text style={styles.value}>{ticket.quantity} ticket(s)</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Ticket ID:</Text>
              <Text style={styles.value}>{ticket.id}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Attendee:</Text>
              <Text style={styles.value}>{ticket.user.name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{ticket.user.email}</Text>
            </View>

            {ticket.transaction.mpesaReceiptNumber && (
              <View style={styles.row}>
                <Text style={styles.label}>M-Pesa Receipt:</Text>
                <Text style={styles.value}>{ticket.transaction.mpesaReceiptNumber}</Text>
              </View>
            )}

            {qrCodeUrl && (
              <View style={styles.qrCode}>
                <Text>Scan to verify ticket:</Text>
                <Image src={qrCodeUrl} style={styles.qrImage} />
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text>This ticket is valid for one-time entry only. Please present this ticket at the venue entrance.</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
} 