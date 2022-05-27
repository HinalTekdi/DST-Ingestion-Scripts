const Excel = require('exceljs');
const {
  addTrainee,
  getIndustryByNameAndDistrict,
  getITIByNameAndDistrict,
  getTraineeByRegisterationNumber
} = require('../utils');
const moment = require('moment');
const filename = 'DST.Production.Data.-.District.in.Trainee (1).xlsx';
let trainees = [];

async function traineeStory() {
  const workbook = new Excel.Workbook();
  workbook.xlsx.readFile(filename)
    .then(async function () {

      // Trainee
      // Get data for trainee from xls
      const worksheet = workbook.getWorksheet('Trainee level data');
      worksheet.eachRow(async function (row, rowNumber) {
        if (rowNumber >= 5) {
          let traineeData = {};
          const dobSplitDate = row.values[15];
          traineeData.id = row.values[1];
          traineeData.itiname = row.values[2];
          traineeData.tradeName = row.values[3];
          traineeData.candidateName = row.values[8];
          traineeData.batch = row.values[5];
          traineeData.industry = row.values[6];
          traineeData.affiliationType = row.values[7] !== undefined ? row.values[10] : null;
          traineeData.registrationNumber = row.values[9];
          traineeData.DOB = moment(dobSplitDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
          traineeData.father = row.values[10] !== undefined ? row.values[10] : null;
          traineeData.mother = row.values[11] !== undefined ? row.values[10] : null;
          traineeData.gender = row.values[12] !== undefined ? row.values[10] : null;
          traineeData.dateOfAdmission = null;
          traineeData.course = row.values[4].split(' ')[0];
          traineeData.district = row.values[20];
          await trainees.push(traineeData);
        }
      });
      // const first = trainees.splice(5363, 100); // start([start number]0, [gap]100) (0, 100),(100, 100), (200, 100)
      for (const item of trainees) {
        // Get trainee by register number
        const traineeRes = await getTraineeByRegisterationNumber({registrationNumber: item.registrationNumber});

        if (!traineeRes.data.trainee.length > 0) {
          const industryRes = await getIndustryByNameAndDistrict({name: item.industry, district: item.district})
          const itiRes = await getITIByNameAndDistrict({name: item.itiname, district: item.district})
          const traineeRequestData = {
            iti: itiRes.data.iti[0].id,
            DOB: moment(item.DOB),
            affiliationType: item.affiliationType,
            batch: item.batch,
            candidateName: item.candidateName,
            industry: industryRes.data.industry[0].id,
            registrationNumber: item.registrationNumber,
            tradeName: item.tradeName,
            father: item.father,
            mother: item.mother,
            gender: item.gender,
            dateOfAdmission: moment(item.dateOfAdmission),
            course: item.course
          }
          const traineeInsertRes = await addTrainee(traineeRequestData)
        }
      }
      console.log(`Trainee added: ${moment()}`);
    });
}

traineeStory()
