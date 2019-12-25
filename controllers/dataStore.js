const dataStore = require('../models/dataStore');
const util = require('util');
const fs = require('fs');
const homeDir = require('os').homedir();
const desktopDir = `${homeDir}/Desktop`;
const { sizeof } = require("file-sizeof");
let serialNumber = require('serial-number');
const device = require('../models/device');
exports.createDataStore = async(req, res) => {
    const writeFile = await util.promisify(fs.writeFile);
    serialNumber = await util.promisify(serialNumber);
    let deviceSerialNumber = undefined;
    await serialNumber().then((value) => {
      deviceSerialNumber =  value;
    }).catch((error) => {
        return res.status(400).json({
          data: {message: 'Unable to get Device Serial Number. Hence Exiting!'}
        });
    });
    let filePath = req.body.filePath === undefined ? desktopDir : req.body.filePath;
    const defaultFileName = "dataStore.json";
    let dataCreateResult = undefined;
    const currentPath = filePath;
    const desktopFilePath = desktopDir;
    let isDifferent = false;
    if(currentPath !== desktopFilePath) {
      isDifferent = true;
    }
    filePath = currentPath + "/" + defaultFileName;
    filePath =  filePath.toString();
    filePath = filePath.replace(/\/\//g, "/");
    const query = {key: req.body.key};
    let error = false;
    let isSaved = false;
    const updatedFilePath = !isDifferent ? desktopFilePath : currentPath;
    let previousFilePath = undefined;
    if(deviceSerialNumber !== undefined) {
        let deviceData = undefined;
        await device.findOne({ID: deviceSerialNumber}).then(async(devResponse) => {
          deviceData = devResponse;
          if(deviceData === null || deviceData === undefined) {
            const deviceModelData = new device({ID: deviceSerialNumber});
            await deviceModelData.save().then(() => {

            }).catch((err) => {
              return res.status(400).json({
                data: {message: 'Unable to store Device Data. Hence Exiting!'}
              });
            });
          }
        }).catch((err) => {
          console.log(err);
          return res.status(400).json({
            data: {message: 'Unable to get Device Data. Hence Exiting!'}
          });
        });
    }
    const fileSize = sizeof.IEC(previousFilePath !== undefined ? previousFilePath + "/" + defaultFileName : filePath);
    const fileSizeInMB = parseInt(fileSize.MB);
    if(fileSizeInMB >= 1024) {
      return res.status(400).json({
        data: {
          message: 'Failed since Size of the JSON File has reached the desired limit: 1GB'}
      });
    }
    await dataStore.findOne(query).then(async(dataStoreResult) => {
        dataCreateResult = dataStoreResult;
        if(dataStoreResult === null || dataStoreResult === undefined) {
            const dataStoreRequestValues = {...req.body};
            const dataStoreData = new dataStore(dataStoreRequestValues);
            await dataStoreData.save().then((dataStoreResult) => {
                isSaved = true;
                dataCreateResult = dataStoreResult;
            }).catch((err) => {
              error = true;
              return res.status(400).json({
                data: {
                  message: 'Failed to save Data Store with given key'
                }
              })
            });
        } else {
          error = true;
          return res.status(400).json({
            data: {
              message: 'Failed since Data Store is already present with the given key'
            }
          });
        }
    }).catch((err) => {
      error = true;
      return res.status(400).json({
          data: {
            message: 'Failed to check Data Store with the given key'
          }
      })
    });
    if(!error && dataCreateResult !== undefined) {
      const fileData = {key: dataCreateResult.key, value: dataCreateResult.value};
      const readFile = await util.promisify(fs.readFile);
      let fileDataResult = [];
      let existingPath = undefined;
      if(desktopFilePath !== currentPath) {
        existingPath = desktopFilePath;
      }
      await readFile(existingPath !== undefined ? existingPath + "/" + defaultFileName : filePath).then((fileResult) => {
        fileDataResult = JSON.parse(fileResult);
      }).catch((err) => {

      });
      if(existingPath !== undefined) {
        const deleteFile = await util.promisify(fs.unlink);
        await deleteFile(existingPath + "/" + defaultFileName).then(() => {

        }).catch((err) => {

        });
      }
      if(fileDataResult !== undefined && fileDataResult.length > 0) {
        fileDataResult.push(fileData);
      } else {
        fileDataResult = [fileData];
      }
      await writeFile(filePath, JSON.stringify(fileDataResult)).then(() => {

      }).catch((err) => {

      });
      res.status(200).json({
        data: {
          message: "Successfully Created Data Store with given key"
        }
      });
   }
};

exports.readDataStore = async(req, res) => {
    let error = false;
    let dataResult = undefined;
    await dataStore.findOne({key: req.body.key}).then((dataStoreResult) => {
        dataResult = dataStoreResult;
        if(dataStoreResult === null || dataStoreResult === undefined) {
            error = true;
            return res.status(401).json({
                message: 'Read Data Store Failed! since No Data Store found with given key'
            });
        }
    }).catch((err) => {
        error = true;
        return res.status(401).json({
            message: 'Failed to read Data Store with given key'
        });
    });
    if(!error && dataResult !== undefined) {
      res.status(200).json({data: {
          result: dataResult
        }
      });
    }
};

exports.deleteDataStore = async(req, res) => {
    let error = false;
    let dataResult = undefined;
    await dataStore.findOneAndDelete({key: req.body.key}).then((dataStoreResult) => {
        dataResult = dataStoreResult;
        if(dataStoreResult === null || dataStoreResult === undefined) {
            error = true;
            return res.status(401).json({
                message: 'Delete Data Store Failed! since No Data Store found with given key'
            });
        }
    }).catch((err) => {
        error = true;
        return res.status(401).json({
            message: 'Failed to delete Data Store with given key'
        });
    });
    if(!error && dataResult !== undefined) {
      const filePath = desktopDir +"/" + "dataStore.json";
      const writeFile = await util.promisify(fs.writeFile);
      const readFile = await util.promisify(fs.readFile);
      const fileData = {key: dataResult.key, value: dataResult.value};
      let fileDataResult = [];
      await readFile(filePath).then((fileResult) => {
        fileDataResult = JSON.parse(fileResult);
      }).catch((err) => {

      });
      if(fileDataResult.length > 0) {
        const filteredFileContents = fileDataResult.filter((data) => {
            return data.key !== dataResult.key;
        });
        let currentFileContents = '';
        if(filteredFileContents.length > 0) {
          currentFileContents = filteredFileContents;
        }
        if(currentFileContents !== '') {
          currentFileContents = JSON.stringify(currentFileContents);
        }
        await writeFile(filePath, currentFileContents).then(() => {

        }).catch((err) => {

        });
      }
      res.status(200).json({
          message: 'Successfully Deleted Data Store with given key'
      });
    }
};
