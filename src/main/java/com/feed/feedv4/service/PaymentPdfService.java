package com.feed.feedv4.service;

import com.feed.feedv4.model.*;
import com.feed.feedv4.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.text.DecimalFormat;
import java.time.LocalDateTime;

@Service
public class PaymentPdfService {

    private final PaymentRepository paymentRepo;
    private final InvoiceRepository invoiceRepo;
    private final PelletingBatchRepository batchRepo;
    private final FactoryRepository factoryRepo;

    public PaymentPdfService(PaymentRepository paymentRepo,
                             InvoiceRepository invoiceRepo,
                             PelletingBatchRepository batchRepo,
                             FactoryRepository factoryRepo) {
        this.paymentRepo = paymentRepo;
        this.invoiceRepo = invoiceRepo;
        this.batchRepo = batchRepo;
        this.factoryRepo = factoryRepo;
    }

    public byte[] exportPaymentReceiptPdf(Long paymentId) {
        Payment p = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        Invoice inv = p.getInvoice();
        if (inv == null) {
            throw new RuntimeException("Payment is not linked to an invoice");
        }

        // numbers
        final double invoiceTotal      = n(inv.getTotalAmount()); // equals inv.amount
        final double paidBefore        = Math.max(0d, n(inv.getPaidAmount()) - n(p.getAmountPaid())); // if Payment already saved
        final double thisPayment       = n(p.getAmountPaid());
        final double remainingAfter    = Math.max(0d, invoiceTotal - (paidBefore + thisPayment));

        // resolve factory from batch -> formulation.factory
        Factory factory = resolveFactory(inv.getBatchId());

        DecimalFormat money = new DecimalFormat("#,##0.00");

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // ===== 1) Header: Factory logo or name =====
            PdfPTable header = new PdfPTable(1);
            header.setWidthPercentage(100);
            if (factory != null && factory.getLogoUrl() != null && !factory.getLogoUrl().isBlank()) {
                try {
                    Image logo = Image.getInstance(new URL(factory.getLogoUrl()));
                    logo.scaleToFit(120, 120);
                    PdfPCell logoCell = new PdfPCell(logo, false);
                    logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    logoCell.setBorder(Rectangle.NO_BORDER);
                    logoCell.setPaddingBottom(8f);
                    header.addCell(logoCell);
                } catch (Exception ignore) {
                    addFactoryName(header, factory != null ? factory.getName() : "RECEIPT");
                }
            } else {
                addFactoryName(header, factory != null ? factory.getName() : "RECEIPT");
            }
            // title
            Paragraph title = new Paragraph("PAYMENT RECEIPT",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(header);
            doc.add(title);
            doc.add(Chunk.NEWLINE);

            // ===== 2) Basic info (Receipt / Invoice / Date / Customer) =====
            PdfPTable info = new PdfPTable(new float[]{48f, 52f});
            info.setWidthPercentage(100);

            PdfPTable left = new PdfPTable(new float[]{42f, 58f});
            left.setWidthPercentage(100);
            addInfo(left, "Receipt No:", String.valueOf(p.getId()));
            addInfo(left, "Invoice No:", inv.getId() != null ? String.valueOf(inv.getId()) : "-");
            String dt = p.getPaymentDate() != null
                    ? p.getPaymentDate().toString().replace('T',' ')
                    : LocalDateTime.now().toString().replace('T',' ');
            addInfo(left, "Payment Date:", dt);

            PdfPCell lc = new PdfPCell(left);
            lc.setBorder(Rectangle.NO_BORDER);
            lc.setPadding(4f);
            info.addCell(lc);

            PdfPTable right = new PdfPTable(1);
            right.setWidthPercentage(100);
            PdfPCell billedHdr = new PdfPCell(new Phrase("PAID BY:",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            billedHdr.setBorder(Rectangle.NO_BORDER);
            billedHdr.setPaddingBottom(4f);
            right.addCell(billedHdr);
            PdfPCell cust = new PdfPCell(new Phrase(
                    inv.getCustomerName() != null ? inv.getCustomerName() : "-",
                    FontFactory.getFont(FontFactory.HELVETICA, 10)));
            cust.setBorder(Rectangle.NO_BORDER);
            right.addCell(cust);

            PdfPCell rc = new PdfPCell(right);
            rc.setBorder(Rectangle.NO_BORDER);
            rc.setPadding(4f);
            info.addCell(rc);

            doc.add(info);
            doc.add(Chunk.NEWLINE);

            // ===== 3) Payment table (single line) =====
            PdfPTable items = new PdfPTable(new float[]{8f, 44f, 18f, 15f, 15f});
            items.setWidthPercentage(100);
            addHeader(items, "#");
            addHeader(items, "DESCRIPTION");
            addHeader(items, "METHOD");
            addHeader(items, "AMOUNT (Rs.)");
            addHeader(items, "NOTES");

            String desc = "Payment for Invoice #" + inv.getId();
            addRow(items,
                    "1",
                    desc,
                    nullToDash(p.getPaymentMethod()),
                    money.format(thisPayment),
                    nullToDash(p.getNotes())
            );
            doc.add(items);
            doc.add(Chunk.NEWLINE);

            // ===== 4) Totals summary =====
            PdfPTable totals = new PdfPTable(new float[]{60f, 40f});
            totals.setWidthPercentage(42);
            totals.setHorizontalAlignment(Element.ALIGN_RIGHT);

            addTotal(totals, "Original Invoice Total:", money.format(invoiceTotal), false);
            addTotal(totals, "Already Paid (before):", money.format(paidBefore), false);
            addTotal(totals, "Amount to Pay (this):", money.format(thisPayment), false);
            addTotal(totals, "Remaining Due (after):", money.format(remainingAfter), true);
            doc.add(totals);
            doc.add(Chunk.NEWLINE);

            // ===== 5) Extra payment attributes (tax/discount if present) =====
            if ((p.getTaxRate() != null && p.getTaxRate() > 0) ||
                (p.getDiscountAmount() != null && p.getDiscountAmount() > 0)) {
                PdfPTable extras = new PdfPTable(new float[]{50f, 50f});
                extras.setWidthPercentage(50);
                extras.setHorizontalAlignment(Element.ALIGN_LEFT);

                if (p.getTaxRate() != null && p.getTaxRate() > 0) {
                    addTotal(extras, "Applied Tax (%):", money.format(p.getTaxRate()), false);
                }
                if (p.getDiscountAmount() != null && p.getDiscountAmount() > 0) {
                    addTotal(extras, "Discount Applied (Rs.):", money.format(p.getDiscountAmount()), false);
                }
                doc.add(extras);
                doc.add(Chunk.NEWLINE);
            }

            // ===== 6) Footer =====
            Paragraph thanks = new Paragraph("Thank you for your payment!",
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9));
            thanks.setAlignment(Element.ALIGN_CENTER);
            doc.add(thanks);

            if (factory != null && factory.getContactNumber() != null) {
                Paragraph contact = new Paragraph("Contact: " + factory.getContactNumber(),
                        FontFactory.getFont(FontFactory.HELVETICA, 8));
                contact.setAlignment(Element.ALIGN_CENTER);
                doc.add(contact);
            }

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Payment receipt PDF export failed", e);
        }
    }

    /* ------------ helpers ------------ */

    private Factory resolveFactory(Long batchId) {
        if (batchId == null) return null;
        PelletingBatch b = batchRepo.findById(batchId).orElse(null);
        if (b != null && b.getFormulation() != null) {
            String fname = b.getFormulation().getFactory();
            if (fname != null && !fname.isBlank()) {
                return factoryRepo.findByNameContainingIgnoreCase(fname)
                        .stream().findFirst().orElse(null);
            }
        }
        return null;
    }

    private static double n(Double v) { return v == null ? 0d : v; }

    private static void addFactoryName(PdfPTable t, String name) {
        PdfPCell c = new PdfPCell(new Phrase(
                name != null ? name : "RECEIPT",
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setBorder(Rectangle.NO_BORDER);
        c.setPaddingBottom(6f);
        t.addCell(c);
    }

    private static void addInfo(PdfPTable t, String label, String value) {
        Font b = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        Font n = FontFactory.getFont(FontFactory.HELVETICA, 10);

        PdfPCell l = new PdfPCell(new Phrase(label, b));
        l.setBorder(Rectangle.NO_BORDER);
        l.setPadding(3f);
        t.addCell(l);

        PdfPCell v = new PdfPCell(new Phrase(value != null ? value : "-", n));
        v.setBorder(Rectangle.NO_BORDER);
        v.setPadding(3f);
        t.addCell(v);
    }

    private static void addHeader(PdfPTable t, String text) {
        PdfPCell c = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setBackgroundColor(new java.awt.Color(240, 240, 240));
        c.setPadding(5f);
        t.addCell(c);
    }

    private static void addRow(PdfPTable t, String idx, String desc, String method, String amount, String notes) {
        t.addCell(cell(idx, Element.ALIGN_CENTER));
        t.addCell(cell(desc, Element.ALIGN_LEFT));
        t.addCell(cell(method, Element.ALIGN_CENTER));
        t.addCell(cell(amount, Element.ALIGN_RIGHT));
        t.addCell(cell(notes, Element.ALIGN_LEFT));
    }

    private static PdfPCell cell(String text, int align) {
        PdfPCell c = new PdfPCell(new Phrase(text != null ? text : "-", FontFactory.getFont(FontFactory.HELVETICA, 10)));
        c.setHorizontalAlignment(align);
        c.setPadding(5f);
        return c;
    }

    private static void addTotal(PdfPTable t, String label, String value, boolean strong) {
        Font f = FontFactory.getFont(strong ? FontFactory.HELVETICA_BOLD : FontFactory.HELVETICA, 10);
        PdfPCell l = new PdfPCell(new Phrase(label, f));
        l.setHorizontalAlignment(Element.ALIGN_RIGHT);
        l.setBorder(Rectangle.NO_BORDER);
        l.setPadding(3f);
        t.addCell(l);

        PdfPCell v = new PdfPCell(new Phrase(value, f));
        v.setHorizontalAlignment(Element.ALIGN_RIGHT);
        v.setBorder(Rectangle.NO_BORDER);
        v.setPadding(3f);
        t.addCell(v);
    }

    private static String nullToDash(String s) { return (s == null || s.isBlank()) ? "-" : s; }
}
