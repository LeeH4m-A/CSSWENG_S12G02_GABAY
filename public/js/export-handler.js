/**
 * Handles all data export functionality (Images, PDF, Excel).
 */

export function setupExportHandlers() {
    
    /**
     * Event listener for exporting the data from dashboard into images.
     * Exports the data into a zip file containing the png images, excel sheet and a summary text file.
    */
    const exportImagesButton = document.getElementById('exportImagesButton');
    if (exportImagesButton) {
        exportImagesButton.addEventListener('click', async () => {
            try {
                // Fetch ExcelJS from server
                const response = await fetch('/exceljs');
                if (!response.ok) throw new Error('Failed to fetch ExcelJS');
                const scriptText = await response.text();
                eval(scriptText); // Make ExcelJS available
                
                // initializing ExcelJS workbook and other necessary variables
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('GABAY Charts Summary');
                const charts = document.querySelectorAll('canvas');
                const zip = new JSZip();
                let summaryContent = '';
                
                // processing each chart
                // Use a for...of loop for async/await compatibility
                for (let i = 0; i < charts.length; i++) {
                    const chart = charts[i];
                    const reason = chart.getAttribute('data-reason') || `Chart ${i + 1}`;
                    const chartInstance = Chart.getChart(chart);

                    if (!chartInstance) {
                        // if chart instance is not found, add placeholder message
                        const mainHeaderStartRow = worksheet.actualRowCount + 1;
                        const mainHeaderCell = worksheet.getCell(`A${mainHeaderStartRow}`);
                        mainHeaderCell.value = `Chart ${i + 1} - ${reason}`;
                        mainHeaderCell.alignment = { horizontal: 'left' };
                        mainHeaderCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Arial', size: 12, family: 2 };
                        mainHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9B112E' } };
                        worksheet.addRow(['No data available yet for this data reason']);
                        summaryContent += `Chart ${i + 1} - ${reason}\n\nNo data available yet for this data reason\n\n-------------------------------------------------\n`;
                        continue;
                    }

                    const datasets = chartInstance.data.datasets;
                    let chartData = []; // preparing data for excel and summary text

                    // populating chart data
                    chartInstance.data.labels.forEach((label, index) => {
                        let rowData = { 'Label': label };
                        // populating data for each category
                        datasets.forEach((dataset, datasetIndex) => {
                            const categoryName = dataset.label || `Category ${datasetIndex + 1}`;
                            rowData[categoryName] = dataset.data[index];
                        });
                        chartData.push(rowData);
                    });

                    // adding main header row
                    const mainHeaderStartRow = worksheet.actualRowCount + 1;
                    const mainHeaderEndColumnIndex = datasets.length;
                    const mainHeaderEndColumn = String.fromCharCode(65 + mainHeaderEndColumnIndex); 
                    const mainHeaderCell = worksheet.getCell(`A${mainHeaderStartRow}`);
                    mainHeaderCell.value = `Chart ${i + 1} - ${reason}`;
                    mainHeaderCell.alignment = { horizontal: 'left' };
                    mainHeaderCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Arial', size: 12, family: 2 };
                    mainHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9B112E' } };
                    if (datasets.length > 0) {
                        worksheet.mergeCells(`A${mainHeaderStartRow}:${mainHeaderEndColumn}${mainHeaderStartRow}`);
                    }
                    // adding subheader row
                    const subheaderRow = worksheet.addRow(['Label', ...datasets.map((dataset, idx) => dataset.label || `Category ${idx + 1}`)]);
                    subheaderRow.eachCell((cell) => {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6AA26' } };
                        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Arial', size: 12, family: 2 };
                        cell.alignment = { horizontal: 'center' };
                    });
                    // adding data rows to worksheet
                    chartData.forEach(dataRow => {
                        const rowData = [dataRow.Label, ...datasets.map(dataset => dataRow[dataset.label] || '')];
                        const dataRowInstance = worksheet.addRow(rowData);
                        dataRowInstance.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                            cell.alignment = { horizontal: (colNumber === 1 ? 'left' : 'center') };
                        });
                    });

                    // adding spacing between charts in summary text
                    summaryContent += `Chart ${i + 1} - ${reason}\n`;
                    // adding category data to summary text
                    datasets.forEach((dataset, datasetIndex) => {
                        const datasetLabel = dataset.label || `Dataset ${datasetIndex + 1}`;
                        summaryContent += `${datasetLabel}:\n`;
                        dataset.data.forEach((value, index) => {
                            const label = chartInstance.data.labels[index];
                            summaryContent += `${label}: ${value}\n`;
                        });
                        summaryContent += '\n';
                    });
                    // adding horizontal line between charts in summary text
                    summaryContent += '-------------------------------------------------\n';

                    // generating image for the chart and adding to ZIP
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    // Use html2canvas on the chart's PARENT container (.chart) for better rendering
                    const chartContainer = chart.closest('.chart');
                    const originalCanvas = await html2canvas(chartContainer || chart);
                    canvas.width = originalCanvas.width;
                    canvas.height = originalCanvas.height + 60; // Add space for title
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.font = 'bold 18px Poppins';
                    ctx.fillStyle = '#000000';
                    ctx.textAlign = 'center';
                    ctx.fillText(reason, canvas.width / 2, 20);
                    ctx.drawImage(originalCanvas, 0, 30);
                    const dataURL = canvas.toDataURL('image/png');
                    zip.file(`chart${i + 1}.png`, dataURL.split('base64,')[1], { base64: true });
                }

                // auto-fit column widths based on content length for all columns
                worksheet.columns.forEach((column) => {
                    let maxWidth = 0;
                    column.eachCell({ includeEmpty: true }, (cell) => {
                        const cellWidth = cell.value ? cell.value.toString().length + 2 : 10;
                        if (cellWidth > maxWidth) maxWidth = cellWidth;
                    });
                    column.width = maxWidth < 25 ? maxWidth : 25;
                });

                // generating excel file and add to ZIP
                const excelBuffer = await workbook.xlsx.writeBuffer();
                zip.file('GABAY Summary.xlsx', excelBuffer);
                // adding summary text file to ZIP
                zip.file('GABAY Summary.txt', summaryContent);
                // generating ZIP file and trigger download
                zip.generateAsync({ type: 'blob' }).then(content => {
                    saveAs(content, 'GABAY Charts & Summary.zip');
                });
            } catch (error) {
                console.error('Error exporting charts and data:', error);
                alert('An error occurred while exporting charts.');
            }
        });
    }

    /** Event listener for exporting the data from dashboard into PDF.
    * Exports the data into a PDF file containing the chart images and a summary
    */
    const exportPDFButton = document.getElementById('exportPDFButton');
    if (exportPDFButton) {
        exportPDFButton.addEventListener('click', async () => {
            try {
                //Setup PDF file
                const summaryPDF = new jsPDF();
                const charts = document.querySelectorAll('canvas');

                for (let i = 0; i < charts.length; i++) {
                    const chart = charts[i];
                    const reason = chart.getAttribute('data-reason') || `Chart ${i+1}`;
                    const chartInstance = Chart.getChart(chart);

                    if (!chartInstance) {
                        // ... (Original logic for no data)
                        summaryPDF.setFontSize(14);
                        summaryPDF.setFont("times", "bold");
                        summaryPDF.text(`Chart ${i + 1}: ${reason}`, 15, 30);
                        summaryPDF.setFontSize(12);
                        summaryPDF.setFont("times", "normal");
                        summaryPDF.text(`There is no data available to show.`, 15, 45);
                        if (i < charts.length - 1) summaryPDF.addPage();
                        continue;
                    }

                    
                    const datasets = chartInstance.data.datasets;
                    const canvasImage = chart.toDataURL('image/jpeg', 1.0); // Use JPEG for PDF
                    
                    summaryPDF.setFontSize(14);
                    summaryPDF.setFont("times", "bold");
                    summaryPDF.text(`Chart ${i + 1}: ${reason}`, 15, 30);
                    summaryPDF.addImage(canvasImage, 'JPEG', 15, 40, 170, 110);
                    summaryPDF.setFontSize(12);
                    summaryPDF.setFont("times", "normal");
                    
                    //This variable is basically top margin
                    let verticalOffset = 160;

                    // adding category data
                    datasets.forEach((dataset) => {
                        const datasetLabel = dataset.label || `Dataset`;
                        summaryPDF.text(`${datasetLabel}:`, 15, verticalOffset);
                        verticalOffset += 5;

                        dataset.data.forEach((value, index) => {
                            const label = chartInstance.data.labels[index];
                            summaryPDF.text(`${label}: ${value}`, 15, verticalOffset);
                            verticalOffset += 5;
                            // Check for page break
                            if (verticalOffset > 280) {
                                summaryPDF.addPage();
                                verticalOffset = 15;
                            }
                        });
                        verticalOffset += 5;
                    });

                    if (i < charts.length - 1) summaryPDF.addPage();
                }
                summaryPDF.save('Gabay-Summary.pdf');
            } catch (error) {
                console.error('Error exporting to PDF:', error);
                alert('An error occurred while exporting to PDF.');
            }
        });
    }
    
    /**
    * Event listener for exporting the overall data from dashboard into excel sheet.
    * Exports the data into excel sheet.
    */
    const exportExcelButton = document.getElementById('exportExcelButton');
    if (exportExcelButton) {
        exportExcelButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/dashboard/export');
                if (response.ok) {
                    const blob = await response.blob();
                    saveAs(blob, 'GABAY Data Sheet.xlsx');
                } else {
                    console.error('Failed to export data:', response.statusText);
                    alert('Failed to export data.');
                }
            } catch (error) {
                console.error('Error exporting data to Excel:', error);
                alert('An error occurred while exporting data.');
            }
        });
    }
}
