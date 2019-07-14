const fs = require('fs');
const test = require('./testingMethods.js');

module.exports = {

  //Reads json file and returns data in object
  read: function(file){
  	try{
  		let data = fs.readFileSync(file,'utf8');
  					return JSON.parse(data);
  	}catch(err){
  		console.log(err);
  	}
  },

  //Writes object to json file
   write: function(file, obj){
     if(obj == undefined){return test.errorLog(`Unable to write ${obj} to ${file}`);}
  	try{
  		json = JSON.stringify(obj);
  		fs.writeFileSync(file, json, 'utf8');
  	}catch(err){
  		console.log(err);
  	}
  },

  stringConverter: function(arr){
    let str = "";

    for(let i = 0; i < arr.length; i++){
      str += arr[i];
      if(i + 1 != arr.length){
        str += " ";
      }
    }

    return str;
  },

  attributeConverter: function(arr){
    let str = "";

    for(let i = 0; i < arr.length; i++){
      if(i != arr.length - 1){
        str += `${arr[i]}, `;
      }else{
        str += `${arr[i]}`;
      }
    }

    return str;
  },

  valueConverter: function(arr){
    let str = "";

    for(let i = 0; i < arr.length; i++){
      if(i != arr.length - 1){
        if(typeof arr[i] == "string"){
          str += `'${arr[i]}', `;
        }else{
          str += `${JSON.stringify(arr[i])}, `;
        }
      }else{
        if(typeof arr[i] == "string"){
          str += `'${arr[i]}'`;
        }else{
          str += `${JSON.stringify(arr[i])}`;
        }
      }
    }

    return str;
  },

  filter: (str) =>{
    return str.replace(`'`, `/'`);
  }
}
