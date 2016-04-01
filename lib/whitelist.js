const list = ['foos'];
function canRespond(webclient, channelId, callback) {
  webclient.channels.info(channelId, function (error, response) {
    callback(error, list.indexOf(response.channel.name) !== -1);
  });
}
module.exports = {
  canRespond
};
