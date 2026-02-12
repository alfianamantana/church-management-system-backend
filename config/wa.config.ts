const axios = require('axios');

exports.sendNotification = async (whatsapp_number: string, message: string) => {
  try {
    let { data } = await axios({
      url: process.env.whatsapp_api_url + `/user/info`,
      headers: {
        Authorization: 'Basic ' + process.env.whatsapp_api_key,
      },
      params: {
        phone: whatsapp_number + '@s.whatsapp.net',
      },
    });

    if (data.code === 'SUCCESS') {
      await axios({
        method: 'POST',
        url: process.env.whatsapp_api_url + `/send/message`,
        headers: {
          Authorization: 'Basic ' + process.env.whatsapp_api_key,
        },
        data: {
          phone: whatsapp_number + '@s.whatsapp.net',
          message: message,
          is_forwarded: false,
        },
      });
    }
  } catch (error) {
    console.log('fail to send message');
  }
};
