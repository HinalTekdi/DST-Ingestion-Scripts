const Excel = require('exceljs');
const {
  addIti,
  addIndustry,
  getIndustryByName,
  getIndustryByNameAndDistrict,
  addIndustrySchedule,
  getITIByNameAndDistrict
} = require('../utils');
const moment = require('moment');
const filename = 'Latest_DST.Production.Data.-.13052022.xlsx';
let industries = [];
let industrySchedule = [];
let iti = [];

async function traineeStory() {
  const workbook = new Excel.Workbook();
  workbook.xlsx.readFile(filename)
    .then(async function () {

      // Industry
      // Get data for industry from xls
      const worksheetOfIndustry = workbook.getWorksheet('Unit wise- OJT status');
      worksheetOfIndustry.eachRow(async function (row, rowNumber) {
        if(rowNumber >= 2) {
          const latLng = row.values[6].split(' ');
          let industryData = {};
          industryData.name = row.values[5];
          industryData.district = row.values[2];
          industryData.latitude = latLng[0];
          industryData.longitude = latLng[1];
          await industries.push(industryData);
        }
      });

      for (item of industries) {
        const industryRes = await getIndustryByNameAndDistrict({name: item.name, district: item.district});
        if (!industryRes.data.industry.length > 0) {
          // Add industry
          await addIndustry(item);
        }
      }
      console.log(`Industry added: ${moment()}`);

      // ITI
      // Get data from ITI
      const worksheetOfITI = workbook.getWorksheet('Unit wise- OJT status');
      worksheetOfITI.eachRow(async function (row, rowNumber) {
        if (rowNumber >= 2) {
          let itiData = {};
          itiData.name = row.values[3];
          itiData.district = row.values[2];
          itiData.latitude = null;
          itiData.longitude = null;
          await iti.push(itiData);
        }
      });

      for (item of iti) {
        const {name, district} = item;
        const itiByNameAndDistrictRes = await getITIByNameAndDistrict({name, district});
        if (!itiByNameAndDistrictRes.data.iti.length > 0) {
          // Add ITI
          await addIti(item);
        }
      }
      console.log(`ITI added: ${moment()}`);

      // Industry schedule
      // Get data for industry from xls
      /*const worksheetOfIndustrySchedule = workbook.getWorksheet('Unit wise- OJT status');
      let columnData = [];

      worksheetOfIndustrySchedule.eachRow(async function (row, rowNumber) {
        if (rowNumber === 1) {
          columnData = row.values;
        }
        if (rowNumber >= 2) {
          // Get industry by name
          const industryRes = await getIndustryByNameAndDistrict({name: row.values[5], district: row.values[2]})
          const itiRes = await getITIByNameAndDistrict({name: row.values[3], district: row.values[2]})
          const batch = row.values[7].split('-');

          for (let column = 8; column < columnData.length - 1 ; column++) {
            if (row.values[column] === 'Sessions ends') {
              break
            }
            // Prepare data of schedule
            const finalDate = moment(columnData[column]).format('YYYY-MM-DD').split('-');
            const scheduleData = {
              batch_start: batch[0],
              batch_end: batch[1],
              industry_id: industryRes.data.industry[0].id,
              month: finalDate[1],
              year: finalDate[0],
              iti: itiRes.data.iti[0].id,
              trade: row.values[4],
              status: row.values[38],
              is_industry: row.values[column] === 'Industry'
            }
           await industrySchedule.push(scheduleData);
          }
        }
      });
      // Add industry schedule
      setTimeout(async () => {

        for (schedule of industrySchedule) {
          console.log('call schedule');
           await addIndustrySchedule(schedule);
        }
        console.log(`Industry schedule added: ${moment()}`);
      }, 5000);*/
    });
}

traineeStory()
