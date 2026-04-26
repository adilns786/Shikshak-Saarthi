# Quick Reference: PBAS PDF Report & Export Features

## How to Export Your PBAS Data

### From HOD Dashboard
1. Navigate to: **http://localhost:3000/hod/dashboard**
2. Click **"Export Dept Data"** button (top right)
3. Dialog opens with export options
4. Choose format: **PDF** or **CSV**
5. Date range defaults to **2020–Current Year** ✓
6. Click **Generate** to download

### From Export Page
1. Navigate to: **http://localhost:3000/export**
2. Find **"My PBAS Data"** section
3. Click **Export Report** button
4. Select sections (all enabled by default):
   - ✓ Faculty Profile
   - ✓ Publications (papers, books)
   - ✓ Research Projects
   - ✓ Patents & Awards
   - ✓ Academic Activities (optional)
   - ✓ Performance Stats (optional)
5. Choose **PDF** or **CSV** format
6. Adjust date range if needed (suggested: 2020–2026)
7. Click **Generate** to download

## What's Included in Each Export

### PDF Export (VESIT-Branded)
✅ Complete faculty information  
✅ All research papers with:
   - Year, Title, Journal/Conference
   - Authors, Indexing, DOI

✅ All publications with:
   - Year, Title, Publisher
   - Authors, Pages, ISBN

✅ Research projects with:
   - Year, Title, Funding Agency
   - Amount, Duration, Status

✅ Consultancy projects with:
   - Year, Title, Agency
   - Amount, Duration, Status

✅ Patents & Awards with:
   - Year, Title, Type
   - Inventors, Patent Number, Status

✅ Research guidance with:
   - Year, Thesis Title, Student Name
   - Level, Status

✅ Invited lectures with:
   - Year, Title, Event, Venue, Country

✅ FDP & Courses with:
   - Year, Course Title, Duration, Organizer

✅ Teaching hours summary  
✅ Summary statistics (total counts)  
✅ Professional formatting with VESIT logo  

### CSV Export
Same data as PDF but in spreadsheet format:
- Can be imported to Excel/Google Sheets
- Tab-separated or comma-separated
- Flattened structure for analysis
- Easy to filter and sort

## Default Settings

| Setting | Default | Can Change |
|---------|---------|-----------|
| Start Year | 2020 | ✓ Yes |
| End Year | Current (2026) | ✓ Yes |
| Format | PDF | ✓ Yes (CSV) |
| Include Summary | Yes | ✓ Yes |
| Include Charts | Yes | ✓ Yes |

## File Naming Convention

### PDF Files
`PBAS_Report_[Faculty Name]_[2020-2026].pdf`
or
`[Department]_Report_2020-2026.pdf`

### CSV Files
`report_2020-03-06_2026-03-06.csv`

## Department Reports (HOD)

### From HOD Dashboard
**Export Dept Data** includes:
- All faculty in department
- Combined statistics
- Yearly trends
- Performance comparisons
- Faculty-wise breakdown table

### Automatic Features
✓ Permission check (HOD ↔ own dept only)  
✓ Date range 2020–current year  
✓ All research categories included  
✓ Visual charts (if PDF)  
✓ Summary statistics  

## Troubleshooting

### PDF Won't Open
- Check browser download folder
- Ensure PDF reader is installed
- Try different browser
- Check file size (should be < 5MB)

### CSV Shows Garbled Text
- Import with UTF-8 encoding
- Use "Text Import" in Excel
- Set delimiter to comma
- Verify data columns

### Missing Data in Export
- Ensure PBAS form was submitted
- Check date range includes target years
- Verify all sections are selected
- Try refreshing page

### Export Too Large
- Select specific years (e.g., 2024-2026)
- Choose specific sections only
- Use CSV instead of PDF
- Export faculty individually

## Data Privacy

✓ All exports filtered by user permissions  
✓ HOD can only export own department  
✓ Faculty can only export own data  
✓ Admin can export all departments  
✓ Downloads encrypted by browser  
✓ No data transmitted to external servers  

## Tips & Tricks

### For Annual Review
1. Export current calendar year only (2026)
2. Include all sections
3. Use PDF format for formal reports
4. Print to file for archive

### For Faculty Evaluation
1. Export full range (2020-2026)
2. Include performance stats
3. Use CSV for spreadsheet analysis
4. Filter by category in Excel

### For Department Reporting
1. HOD exports department data
2. Combine with analytics dashboard
3. Generate charts in Excel/Sheets
4. Include in annual reports

### For Institutional Records
1. Export with full date range
2. Archive as PDF (stable format)
3. Store in encrypted folder
4. Backup every academic year

## Supported Browsers

| Browser | PDF | CSV | Print |
|---------|-----|-----|-------|
| Chrome | ✓ | ✓ | ✓ |
| Firefox | ✓ | ✓ | ✓ |
| Safari | ✓ | ✓ | ✓ |
| Edge | ✓ | ✓ | ✓ |

## Performance

- PDF generation: ~1-3 seconds
- CSV generation: ~500ms
- Large exports (5+ years): ~5 seconds max
- Download speed depends on file size

## Support

For issues:
1. Check this quick reference
2. Review PDF export settings
3. Clear browser cache
4. Contact IT support

---

**Last Updated:** March 6, 2026
**Status:** ✅ Ready for Production
