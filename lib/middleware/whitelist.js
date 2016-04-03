const list = ['foos', 'mikestest'];
function canRespond(webclient, channelId, callback) {
  webclient.groups.info(channelId, function (error, response) {
    debugger;
    if (error) {
      return console.log(error)
    }
    callback(error, list.indexOf(response.group.name) !== -1);
  });
}
module.exports = {
  canRespond
};
