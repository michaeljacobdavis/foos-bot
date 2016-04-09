function list(type, channelList) {
  return function (next, event, data) {
    this.web.channels.info(data.channel, (error, response) => {
      if (error || !response.ok) {
        // We're not in a channel, try group
        return this.web.groups.info(data.channel, function (error, response) {
          if (error || !response.ok) {
            // We're not in a group either, keep going.
            return next();
          }
          if (type === 'whitelist' && channelList.indexOf(response.group.name) !== -1) {
            return next();
          }
          if (type === 'blacklist' && channelList.indexOf(response.group.name) === -1) {
            return next();
          }

          // Exit
          return;

        });
      }
      if (type === 'whitelist' && channelList.indexOf(response.channel.name) !== -1) {
        return next();
      }
      if (type === 'blacklist' && channelList.indexOf(response.channel.name) === -1) {
        return next();
      }

      // Exit
      return;
    });
  };
};

module.exports = {
  whitelist: list.bind(null, 'whitelist'),
  blacklist: list.bind(null, 'blacklist')
};
