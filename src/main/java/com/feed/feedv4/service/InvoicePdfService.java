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
import java.util.Optional;
import java.util.function.Function;

@Service
public class InvoicePdfService {

    private final InvoiceRepository invoiceRepo;
    private final PelletingBatchRepository batchRepo;
    private final FormulationRepository formulationRepo;
    private final FactoryRepository factoryRepo;

    public InvoicePdfService(InvoiceRepository invoiceRepo,
                             PelletingBatchRepository batchRepo,
                             FormulationRepository formulationRepo,
                             FactoryRepository factoryRepo) {
        this.invoiceRepo = invoiceRepo;
        this.batchRepo = batchRepo;
        this.formulationRepo = formulationRepo;
        this.factoryRepo = factoryRepo;
    }

    public byte[] exportInvoicePdf(Long id) {
        Invoice inv = invoiceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Resolve Factory (via formulation.factory name) if batchId is present
        Factory factory = null;
        if (inv.getBatchId() != null) {
            batchRepo.findById(inv.getBatchId()).ifPresent(b -> {
                Formulation f = b.getFormulation();
                if (f != null && f.getFactory() != null && !f.getFactory().isBlank()) {
                    // best-effort by name
                    Optional<Factory> fx = factoryRepo.findByNameContainingIgnoreCase(f.getFactory())
                            .stream().findFirst();
                    fx.ifPresent(v -> {}); // no-op for lambda capture
                }
            });
            // re-fetch cleanly (above was just for capture)
            PelletingBatch b = batchRepo.findById(inv.getBatchId()).orElse(null);
            if (b != null && b.getFormulation() != null) {
                String fname = b.getFormulation().getFactory();
                if (fname != null && !fname.isBlank()) {
                    factory = factoryRepo.findByNameContainingIgnoreCase(fname)
                            .stream().findFirst().orElse(null);
                }
            }
        }

        DecimalFormat money = new DecimalFormat("#,##0.00");
        Function<Double, String> fmtMoney = (n) -> money.format(n == null ? 0.0 : n);
        double amount = inv.getAmount(); // no tax/discount on invoice (by your note)

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // ---------- Header: Left (logo+factory) ----------
            PdfPTable header = new PdfPTable(new float[]{60f, 40f});
            header.setWidthPercentage(100);

            PdfPTable left = new PdfPTable(1);
            left.setWidthPercentage(100);

            if (factory != null && factory.getLogoUrl() != null && !factory.getLogoUrl().isBlank()) {
                try {
                    Image logo = Image.getInstance(new URL(factory.getLogoUrl()));
                    logo.scaleToFit(90, 90);
                    PdfPCell lc = new PdfPCell(logo, false);
                    lc.setBorder(Rectangle.NO_BORDER);
                    lc.setPaddingBottom(6f);
                    left.addCell(lc);
                } catch (Exception ignore) {
                    // logo optional; ignore failures
                }
            }

            String facTitle = factory != null ? factory.getName() : "Factory";
            Paragraph facName = new Paragraph(facTitle, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
            PdfPCell facCell = new PdfPCell(facName);
            facCell.setBorder(Rectangle.NO_BORDER);
            left.addCell(facCell);

            StringBuilder facLines = new StringBuilder();
            if (factory != null) {
                if (factory.getAddress() != null) facLines.append(factory.getAddress()).append("\n");
                if (factory.getContactNumber() != null) facLines.append("Tel: ").append(factory.getContactNumber()).append("\n");
                if (factory.getEmail() != null) facLines.append(factory.getEmail()).append("\n");
                if (factory.getRegistrationNumber() != null) facLines.append("Reg: ").append(factory.getRegistrationNumber()).append("\n");
            }
            PdfPCell facInfo = new PdfPCell(new Phrase(facLines.toString(), FontFactory.getFont(FontFactory.HELVETICA, 9)));
            facInfo.setBorder(Rectangle.NO_BORDER);
            left.addCell(facInfo);

            // Right block: INVOICE meta
            PdfPTable right = new PdfPTable(new float[]{48f, 52f});
            right.setWidthPercentage(100);

            right.addCell(kv("INVOICE NO.", String.valueOf(inv.getId())));
            String issued = (inv.getDateIssued() != null ? inv.getDateIssued().toLocalDate().toString()
                    : LocalDateTime.now().toLocalDate().toString());
            right.addCell(kv("DATE", issued));

            if (inv.getBatchId() != null) {
                right.addCell(kv("BATCH ID", String.valueOf(inv.getBatchId())));
                right.addCell(blank());
            }

            PdfPCell leftWrap = new PdfPCell(left);
            leftWrap.setBorder(Rectangle.NO_BORDER);

            PdfPCell rightWrap = new PdfPCell(right);
            rightWrap.setBorder(Rectangle.NO_BORDER);

            header.addCell(leftWrap);
            header.addCell(rightWrap);
            doc.add(header);

            doc.add(Chunk.NEWLINE);

            // ---------- Billed To ----------
            PdfPTable billed = new PdfPTable(new float[]{18f, 82f});
            billed.setWidthPercentage(100);
            billed.addCell(tag("BILLED TO:"));
            billed.addCell(val(inv.getCustomerName() != null ? inv.getCustomerName() : "-"));
            doc.add(billed);

            doc.add(Chunk.NEWLINE);

            // ---------- Items (single line) ----------
            PdfPTable items = new PdfPTable(new float[]{8f, 54f, 14f, 12f, 12f});
            items.setWidthPercentage(100);

            items.addCell(th("#"));
            items.addCell(th("PRODUCT / SERVICE"));
            items.addCell(th("QTY"));
            items.addCell(th("UNIT PRICE (Rs.)"));
            items.addCell(th("LINE TOTAL (Rs.)"));

            items.addCell(tdCenter("1"));
            items.addCell(td(inv.getServiceType() != null ? inv.getServiceType() : "Service"));
            items.addCell(tdCenter("1"));
            items.addCell(tdRight(fmtMoney.apply(amount)));
            items.addCell(tdRight(fmtMoney.apply(amount)));

            doc.add(items);

            doc.add(Chunk.NEWLINE);

            // ---------- Summary ----------
            PdfPTable summary = new PdfPTable(new float[]{58f, 42f});
            summary.setWidthPercentage(60);
            summary.setHorizontalAlignment(Element.ALIGN_RIGHT);

            summary.addCell(blank());
            summary.addCell(kvRow("Subtotal", fmtMoney.apply(amount), true));

            // No tax/discount per your note — show Grand Total = amount
            summary.addCell(blank());
            summary.addCell(kvRowBold("GRAND TOTAL", fmtMoney.apply(amount)));

            doc.add(summary);

            doc.add(Chunk.NEWLINE);

            // ---------- Terms ----------
            Paragraph termsTitle = new Paragraph("TERMS & CONDITIONS",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10));
            doc.add(termsTitle);

            com.lowagie.text.List tlist = new com.lowagie.text.List(false, 10);
            tlist.add(new ListItem("Goods once sold are not returnable."));
            tlist.add(new ListItem("Complaints should be made within 24 hours of delivery."));
            tlist.add(new ListItem("Interest may be charged on overdue invoices."));
            doc.add(tlist);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Invoice PDF export failed", e);
        }
    }

    // ---------- small helpers ----------
    private PdfPCell kv(String k, String v) {
        PdfPTable t = new PdfPTable(new float[]{46f, 54f});
        t.setWidthPercentage(100);
        PdfPCell kCell = new PdfPCell(new Phrase(k, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9)));
        PdfPCell vCell = new PdfPCell(new Phrase(v != null ? v : "-", FontFactory.getFont(FontFactory.HELVETICA, 9)));
        kCell.setBorder(Rectangle.BOX); vCell.setBorder(Rectangle.BOX);
        kCell.setPadding(4f); vCell.setPadding(4f);
        t.addCell(kCell); t.addCell(vCell);
        PdfPCell wrap = new PdfPCell(t);
        wrap.setBorder(Rectangle.NO_BORDER);
        return wrap;
    }

    private PdfPCell th(String txt) {
        PdfPCell c = new PdfPCell(new Phrase(txt, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9)));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setBackgroundColor(new java.awt.Color(238, 238, 238));
        c.setPadding(6f);
        return c;
    }

    private PdfPCell td(String txt) {
        PdfPCell c = new PdfPCell(new Phrase(txt != null ? txt : "-", FontFactory.getFont(FontFactory.HELVETICA, 9)));
        c.setPadding(5f);
        return c;
    }
    private PdfPCell tdCenter(String txt) { PdfPCell c = td(txt); c.setHorizontalAlignment(Element.ALIGN_CENTER); return c; }
    private PdfPCell tdRight(String txt) { PdfPCell c = td(txt); c.setHorizontalAlignment(Element.ALIGN_RIGHT); return c; }
    private PdfPCell blank() { PdfPCell c = new PdfPCell(new Phrase(" ")); c.setBorder(Rectangle.NO_BORDER); return c; }

    private PdfPCell val(String txt) {
        PdfPCell c = new PdfPCell(new Phrase(txt, FontFactory.getFont(FontFactory.HELVETICA, 9)));
        c.setBorder(Rectangle.BOX);
        c.setPadding(6f);
        return c;
    }

    private PdfPCell tag(String txt) {
        PdfPCell c = new PdfPCell(new Phrase(txt, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9)));
        c.setBorder(Rectangle.NO_BORDER);
        return c;
    }

    private PdfPCell kvRow(String k, String v, boolean shaded) {
        PdfPTable t = new PdfPTable(new float[]{58f, 42f});
        t.setWidthPercentage(100);
        PdfPCell kCell = new PdfPCell(new Phrase(k, FontFactory.getFont(FontFactory.HELVETICA, 9)));
        PdfPCell vCell = new PdfPCell(new Phrase(v, FontFactory.getFont(FontFactory.HELVETICA, 9)));
        kCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        vCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        if (shaded) {
            java.awt.Color c = new java.awt.Color(245,245,245);
            kCell.setBackgroundColor(c); vCell.setBackgroundColor(c);
        }
        kCell.setPadding(6f); vCell.setPadding(6f);
        t.addCell(kCell); t.addCell(vCell);
        PdfPCell wrap = new PdfPCell(t); wrap.setBorder(Rectangle.NO_BORDER);
        return wrap;
    }

    private PdfPCell kvRowBold(String k, String v) {
        PdfPTable t = new PdfPTable(new float[]{58f, 42f});
        t.setWidthPercentage(100);
        PdfPCell kCell = new PdfPCell(new Phrase(k, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        PdfPCell vCell = new PdfPCell(new Phrase(v, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        kCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        vCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        kCell.setPadding(7f); vCell.setPadding(7f);
        t.addCell(kCell); t.addCell(vCell);
        PdfPCell wrap = new PdfPCell(t); wrap.setBorder(Rectangle.NO_BORDER);
        return wrap;
    }
}
