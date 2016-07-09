var path = require('path');
var fs = require('fs');
var colors = require('colors');
var configs = {"shellbuddyscript_path":null, "shellbuddyjson_name":"shellbuddy.json", "shellbuddyjson_path":null, "historyjson_path":"/root/.bash_history"}
var data = {"historylist": [], "shellbuddylist": []};
var all_options = ["-a", "-r", "-l", "-e","-mc","-h"];

loadConfigs().then(loadHistory).then(loadshellbuddyJSON).then(main);

function loadConfigs() {
  configs.shellbuddyscript_path = __filename;
  configs.shellbuddyjson_path = path.dirname(require.main.filename) + "/" + configs.shellbuddyjson_name;
  return Promise.resolve();
}

function main() {
  var argument_list = process.argv;
  //Clean up argument_list. Remove app script, node script names from list.
  var posAppScript = argument_list.indexOf(configs.shellbuddyscript_path);
  var posNodeScript = argument_list[0].indexOf("node");
  if (posAppScript != -1)  argument_list.splice(posAppScript,1);
  if (posNodeScript != -1 && posNodeScript != posAppScript)  argument_list.splice(0,1);

  //Determine what operation user wants to run
  var fOperation;
  if (argument_list.indexOf("-h") != -1) funcTask = operationRecentHistory;
  else if (argument_list.indexOf("-a") != -1) funcTask = operationAdd;
  else if (argument_list.indexOf("-r") != -1) funcTask = operationRemove;
  else if (argument_list.indexOf("-l") != -1) funcTask = operationList;
  else if (argument_list.indexOf("-e") != -1) funcTask = operationEmail;
  else if (argument_list.length == 0) funcTask = operationHelp;
  else funcTask = operationSearch;
  //Run appropriate operation
  funcTask(argument_list);
}

function raiseError(error) {
  console.log("Error: ".bold + error );
  exit();
}

function operationRecentHistory() {
  console.log("RECENT COMMANDS".bold.gray)
  var limit = 30;
  var historyLength = data.historylist.length;
  //if (data.historylist.length < 20) limit = data.historylist.length;
  for (i=0;i<50;i++) {
    output = "(" + Number(limit - i) + ")" + data.historylist[historyLength - limit + i].command;
    console.log(output.bold);
  }
}
function operationSearch(args) {
  var res_count = 0;
  var searchComment, searchCommand;
  keyword = args[0];
  console.log(keyword.bold.inverse + " search results");
  for (index in data.shellbuddylist) {
    searchComment = data.shellbuddylist[index].comment.indexOf(keyword);
    searchCommand = data.shellbuddylist[index].command.indexOf(keyword);
    if (searchComment != -1 || searchCommand != -1) {
      res_count = res_count + 1;
      printOneBookmark(res_count,index);

    }
  }
  if (res_count == 0) {
    console.log("Found 0 results");
  }
}
function operationRemove(args) {
  args.splice(0,1);
  if (args.length == 1) {
    posToRemove = Number(args[0]) - 1;
    if (posToRemove > -1 && posToRemove < data.shellbuddylist.length) {
      removedEl = data.shellbuddylist.splice(posToRemove,1);
      console.log("REMOVED".bold);
      saveJson();
    } else {
      raiseError("Item not found");
    }
  } else {
    raiseError("Invalid arguments.");
  }
}

function operationList() {
  var commands = [];
  console.log("ALL BOOKMARKS".bold.gray)
  for (index in data.shellbuddylist) {
    printedIndex = Number(index) + 1;
    printOneBookmark(printedIndex,index);
  }
}
function operationEmail() {
  console.log("email");
}
function operationHelp() {
  console.log("EXAMPLES".inverse.bold);
  console.log("buddy php".bold + " \n search for bookmarks containing 'php'");
  console.log("buddy -l".bold + " \n list all bookmarks");
  console.log("buddy -h".bold + " \n see recent bash history");
  console.log("buddy -a reload mysql".bold + " \n bookmark the last bash command with given comment");
  console.log("buddy -a install LAMP -mc 3 8".bold + " \n bookmark command #3 and #8 with given comment. \n must run buddy -h first to get command numbers.");
  console.log("buddy -r 3".bold + " \n remove bookmark #3 obtained from buddy -l");
}
function operationAdd(args) {
  commandList = getOptionData("-mc");
  comment = getOptionData("-a");
  addToshellbuddyJSON(comment.join(" "),commandList);
}

function loadHistory() {
  var history_entry = {"time":"","command":""};
  var history_final = [ ];
  var count = 0;
  fileBuffer =  fs.readFileSync(configs.historyjson_path);
  history_data = fileBuffer.toString();
  history_data = history_data.split("\n");
  history_data.pop();
  historyStart = history_data.length * -1 - 1;
  if (history_data.length > 100) history_data = history_data.splice(history_data.length-100);
  for (i=0; i<history_data.length;i++) {
    if (history_data[i].indexOf("#") == 0) {
      data.historylist[count] = {"time":history_data[i], "command": history_data[i+1]};
      //data.historylist.push(history_entry);
      count++;
      i++;
    }
  }
  return Promise.resolve();
}

function loadshellbuddyJSON() {
  fileBuffer =  fs.readFileSync(configs.shellbuddyjson_path);
  shellbuddyjson = fileBuffer.toString();
  data.shellbuddylist = JSON.parse(shellbuddyjson);
  return Promise.resolve();
}

function addToshellbuddyJSON(comment,lineNumbers) {

  var last_cmd = {command:""};
  var command_text = "";
  if (lineNumbers.length > 0) {
    //check if actual last command was for history; if not, give error since history might be stale
    histCheck = data.historylist[data.historylist.length-1];
    if (histCheck.command.indexOf("-h") === -1) {
      raiseError("please run buddy -h before trying to add multiple commands(-mc)")
    }
    history_count = data.historylist.length;
    for (i in lineNumbers) {
      historylist_offset = history_count - lineNumbers[i] - 1;
      last_cmd.command = last_cmd.command + data.historylist[historylist_offset].command + "buddynewline";
      last_cmd.time = data.historylist[historylist_offset].time;
    }
  } else {
    last_cmd = data.historylist[data.historylist.length-1];
  }
  var new_entry = {"time":last_cmd.time, "command":last_cmd.command, "comment":comment};
  data.shellbuddylist.push(new_entry);
  var jsonString = JSON.stringify(data.shellbuddylist);
  fs.writeFileSync(configs.shellbuddyjson_path, jsonString, {flag:'w'},function(err) {
  });
  console.log("ADDED -> ".bold.gray + new_entry.comment.bold + ": " + new_entry.command.blue)
}

function saveJson() {
  var jsonString = JSON.stringify(data.shellbuddylist);
  fs.writeFileSync(configs.shellbuddyjson_path, jsonString, {flag:'w'},function(err) {
  });
}

function getOptionData(whichOption) {
  var split_args = process.argv;
  var arg_start = -1;
  var arg_end = -1;
  var returnArr;
  for (one_arg in split_args) {
    if (split_args[one_arg] == whichOption) arg_start = one_arg;
    if (arg_start != -1 && split_args[one_arg] != whichOption && all_options.indexOf(split_args[one_arg]) > -1) arg_end = one_arg;
  }
  if (arg_start != -1 && arg_end == -1) arg_end = split_args.length;
  //option_data = split_args.splice(arg_start+1,arg_end - arg_start - 1);
  arg_start = Number(arg_start);
  arg_end = Number(arg_end);
  returnArr = split_args.splice(arg_start+1,arg_end - arg_start -1);
  return returnArr;
}

function isTextNumber(text) {
  return /^\d+$/.test(text);
}
function exit() {
  console.log("exiting");
  process.exit(0);
}

function cleanNewLines(command) {
  command = command.split("buddynewline");
  return command
}

function printOneBookmark(printedIndex,index) {
  output_1 = "(" + printedIndex + ")" + data.shellbuddylist[index].comment;
  commands = cleanNewLines(data.shellbuddylist[index].command);
  if (commands.length == 1) {
    console.log(output_1.bold + ": ");
    console.log("   " + commands[0].blue)
  } else {
    console.log(output_1.bold + ": ");
    console.log("   " +  commands.join("\n   ").blue);
  }
}
