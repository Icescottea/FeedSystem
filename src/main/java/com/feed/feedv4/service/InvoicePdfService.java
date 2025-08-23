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

            // ========== 1. FACTORY LOGO/NAME SECTION ==========
            PdfPTable logoSection = new PdfPTable(1);
            logoSection.setWidthPercentage(100);
            
            if (factory != null && factory.getLogoUrl() != null && !factory.getLogoUrl().isBlank()) {
                try {
                    Image logo = Image.getInstance(new URL(factory.getLogoUrl()));
                    logo.scaleToFit(120, 120);
                    logo.setAlignment(Element.ALIGN_CENTER);
                    PdfPCell logoCell = new PdfPCell(logo, false);
                    logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    logoCell.setBorder(Rectangle.NO_BORDER);
                    logoCell.setPaddingBottom(10f);
                    logoSection.addCell(logoCell);
                } catch (Exception ignore) {
                    // If logo fails, fall back to factory name
                    addFactoryName(factory, logoSection);
                }
            } else if (factory != null) {
                addFactoryName(factory, logoSection);
            } else {
                PdfPCell noFactoryCell = new PdfPCell(new Phrase("INVOICE", 
                        FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));
                noFactoryCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                noFactoryCell.setBorder(Rectangle.NO_BORDER);
                logoSection.addCell(noFactoryCell);
            }
            
            doc.add(logoSection);
            doc.add(Chunk.NEWLINE);

            // ========== 2. BASIC INFO SECTION ==========
            PdfPTable basicInfoTable = new PdfPTable(2);
            basicInfoTable.setWidthPercentage(100);
            basicInfoTable.setWidths(new float[]{40f, 60f});
            
            // Left side - Invoice details
            PdfPTable invoiceDetails = new PdfPTable(2);
            invoiceDetails.setWidthPercentage(100);
            invoiceDetails.setWidths(new float[]{40f, 60f});
            
            invoiceDetails.addCell(createInfoCell("Invoice Number:", true));
            invoiceDetails.addCell(createInfoCell(String.valueOf(inv.getId()), false));
            
            if (inv.getBatchId() != null) {
                invoiceDetails.addCell(createInfoCell("Batch ID:", true));
                invoiceDetails.addCell(createInfoCell(String.valueOf(inv.getBatchId()), false));
            }
            
            String issued = (inv.getDateIssued() != null ? inv.getDateIssued().toLocalDate().toString()
                    : LocalDateTime.now().toLocalDate().toString());
            invoiceDetails.addCell(createInfoCell("Date:", true));
            invoiceDetails.addCell(createInfoCell(issued, false));
            
            PdfPCell invoiceDetailsCell = new PdfPCell(invoiceDetails);
            invoiceDetailsCell.setBorder(Rectangle.NO_BORDER);
            invoiceDetailsCell.setPadding(5f);
            
            // Right side - Billed to
            PdfPTable billedToTable = new PdfPTable(1);
            billedToTable.setWidthPercentage(100);
            
            PdfPCell billedToHeader = new PdfPCell(new Phrase("BILLED TO:", 
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            billedToHeader.setBorder(Rectangle.NO_BORDER);
            billedToHeader.setPaddingBottom(5f);
            billedToTable.addCell(billedToHeader);
            
            PdfPCell customerCell = new PdfPCell(new Phrase(
                    inv.getCustomerName() != null ? inv.getCustomerName() : "-", 
                    FontFactory.getFont(FontFactory.HELVETICA, 10)));
            customerCell.setBorder(Rectangle.NO_BORDER);
            billedToTable.addCell(customerCell);
            
            PdfPCell billedToCell = new PdfPCell(billedToTable);
            billedToCell.setBorder(Rectangle.NO_BORDER);
            billedToCell.setPadding(5f);
            
            basicInfoTable.addCell(invoiceDetailsCell);
            basicInfoTable.addCell(billedToCell);
            doc.add(basicInfoTable);
            
            doc.add(Chunk.NEWLINE);

            // ========== 3. INVOICE TABLE SECTION ==========
            PdfPTable itemsTable = new PdfPTable(5);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{10f, 50f, 15f, 15f, 15f});
            
            // Table headers
            itemsTable.addCell(createTableHeaderCell("#"));
            itemsTable.addCell(createTableHeaderCell("DESCRIPTION"));
            itemsTable.addCell(createTableHeaderCell("QTY"));
            itemsTable.addCell(createTableHeaderCell("UNIT PRICE (Rs.)"));
            itemsTable.addCell(createTableHeaderCell("TOTAL (Rs.)"));
            
            // Table content
            itemsTable.addCell(createTableCell("1", Element.ALIGN_CENTER));
            itemsTable.addCell(createTableCell(
                inv.getServiceType() != null ? inv.getServiceType() : "Service", 
                Element.ALIGN_LEFT
            ));
            itemsTable.addCell(createTableCell("1", Element.ALIGN_CENTER));
            itemsTable.addCell(createTableCell(fmtMoney.apply(amount), Element.ALIGN_RIGHT));
            itemsTable.addCell(createTableCell(fmtMoney.apply(amount), Element.ALIGN_RIGHT));
            
            doc.add(itemsTable);
            doc.add(Chunk.NEWLINE);

            // ========== 4. GRAND TOTAL TABLE SECTION ==========
            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(40);
            totalTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalTable.setWidths(new float[]{60f, 40f});
            
            totalTable.addCell(createTotalCell("Subtotal:", false, Element.ALIGN_RIGHT));
            totalTable.addCell(createTotalCell(fmtMoney.apply(amount), false, Element.ALIGN_RIGHT));
            
            // Add empty row for spacing
            totalTable.addCell(createTotalCell(" ", false, Element.ALIGN_RIGHT));
            totalTable.addCell(createTotalCell(" ", false, Element.ALIGN_RIGHT));
            
            totalTable.addCell(createTotalCell("GRAND TOTAL:", true, Element.ALIGN_RIGHT));
            totalTable.addCell(createTotalCell(fmtMoney.apply(amount), true, Element.ALIGN_RIGHT));
            
            doc.add(totalTable);
            doc.add(Chunk.NEWLINE);

            // ========== 5. TERMS AND CONDITIONS TABLE SECTION ==========
            PdfPTable termsTable = new PdfPTable(1);
            termsTable.setWidthPercentage(100);
            
            PdfPCell termsHeader = new PdfPCell(new Phrase("TERMS AND CONDITIONS", 
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            termsHeader.setBorder(Rectangle.NO_BORDER);
            termsHeader.setPaddingBottom(5f);
            termsTable.addCell(termsHeader);
            
            com.lowagie.text.List termsList = new com.lowagie.text.List(false, 10);
            termsList.add(new ListItem("Payment is due within 30 days of invoice date."));
            termsList.add(new ListItem("A 1.5% monthly service charge is applicable on overdue accounts."));
            termsList.add(new ListItem("Goods remain the property of the seller until paid in full."));
            termsList.add(new ListItem("Returned goods will not be accepted without prior authorization."));
            
            PdfPCell termsContent = new PdfPCell();
            termsContent.addElement(termsList);
            termsContent.setBorder(Rectangle.NO_BORDER);
            termsContent.setPadding(5f);
            termsTable.addCell(termsContent);
            
            doc.add(termsTable);
            doc.add(Chunk.NEWLINE);

            // ========== 6. FOOTER SECTION ==========
            Paragraph footer = new Paragraph();
            footer.add(new Chunk("Thank you for your business!", 
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9)));
            footer.setAlignment(Element.ALIGN_CENTER);
            
            Paragraph contact = new Paragraph();
            if (factory != null && factory.getContactNumber() != null) {
                contact.add(new Chunk("Contact: " + factory.getContactNumber(), 
                        FontFactory.getFont(FontFactory.HELVETICA, 8)));
            }
            contact.setAlignment(Element.ALIGN_CENTER);
            
            doc.add(footer);
            doc.add(contact);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Invoice PDF export failed", e);
        }
    }

    // Helper method to add factory name
    private void addFactoryName(Factory factory, PdfPTable table) {
        PdfPCell nameCell = new PdfPCell(new Phrase(factory.getName(), 
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));
        nameCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        nameCell.setBorder(Rectangle.NO_BORDER);
        nameCell.setPaddingBottom(10f);
        table.addCell(nameCell);
    }
    
    // Helper method to create info cells
    private PdfPCell createInfoCell(String text, boolean isBold) {
        Font font = isBold ? 
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10) : 
                FontFactory.getFont(FontFactory.HELVETICA, 10);
                
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(3f);
        return cell;
    }
    
    // Helper method to create table header cells
    private PdfPCell createTableHeaderCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, 
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(new java.awt.Color(240, 240, 240));
        cell.setPadding(5f);
        return cell;
    }
    
    // Helper method to create table content cells
    private PdfPCell createTableCell(String text, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, 
                FontFactory.getFont(FontFactory.HELVETICA, 10)));
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(5f);
        return cell;
    }
    
    // Helper method to create total cells
    private PdfPCell createTotalCell(String text, boolean isBold, int alignment) {
        Font font = isBold ? 
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10) : 
                FontFactory.getFont(FontFactory.HELVETICA, 10);
                
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(3f);
        return cell;
    }
}