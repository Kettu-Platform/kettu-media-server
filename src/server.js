const NodeMediaServer = require('node-media-server');
const axios = require('axios');
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    mediaroot: './media',
    webroot: './www',
    allow_origin: '*',
    api: true
  },
  // https: {
  //   port: 8443,
  //   key: './privatekey.pem',
  //   cert: './certificate.pem',
  // },
  // auth: {
  //   api: true,
  //   api_user: 'admin',
  //   api_pass: 'admin',
  // },
  fission: {
    ffmpeg: '/usr/local/share/ffmpeg',
    tasks: [
      {
        rule: "v1/*",
        model: [
          {
            ab: "128k",
            vb: "1500k",
            vs: "1280x720",
            vf: "30",
          },
          {
            ab: "96k",
            vb: "1000k",
            vs: "854x480",
            vf: "24",
          },
          {
            ab: "96k",
            vb: "600k",
            vs: "640x360",
            vf: "20",
          },
        ]
      }
    ]
  }

};

var nms = new NodeMediaServer(config)
nms.run();

nms.on('preConnect', (id, args) => {
  //console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
  // console.log('CONNECT PRE', id, session)
});

nms.on('postConnect', (id, args) => {
  // console.log("POSTTTT")
  //console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id, args) => {
  console.log('CONNECT DONE', id, args);

  // enviar peticion con id + ip como desconectado, si es streamer no hacer nada, si es viewer remove stat
  if(args.query?.mediaId) {
    axios.post(`${process.env.API_URL}/metrics`, {
      channelId: args.query.channelId,
      userId: args.query.userId,
      mediaId: args.query.mediaId,
      type: 'view',
      value: -1,
    })
    .then((data) => {
      console.log('unview ok')
    })
    .catch((err) => {
      console.log('error view')
      //console.log(err, 'error disconnecting')
    })
  }

  //console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', (id, streamPath, args) => {
  // streamer empieza stream
  // aqui validamos token y credenciales
  console.log('prepublish')
  //console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${streamPath} args=${JSON.stringify(args)}`);
  axios.post(`${process.env.API_URL}/stream/connect`, {
    token: args.sign,
    viewerToken: streamPath.split('/').pop()
  })
  .then((data) => {
    console.log('connect ok')
  })
  .catch((err) => {
    console.log('error', err)
    // let session = nms.getSession(id);
    // session.reject();
  })
  
});

nms.on('postPublish', (id, StreamPath, args) => {
  //stream ok
  //console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});


nms.on('donePublish', (id, streamPath, args) => {
  // stream desconectado
  console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${streamPath} args=${JSON.stringify(args)}`);
  axios.post(`${process.env.API_URL}/stream/disconnect`, {
    token: args.sign,
    viewerToken: streamPath.split('/').pop()
  })
  .then((data) => {
    console.log('disconnect ok')
  })
  .catch((err) => {
    console.log('error disconnect')
    //console.log(err, 'error disconnecting')
  })

});

nms.on('prePlay', (id, streamPath, args) => {
  console.log('PRE PLAY', JSON.stringify(args))
  // viewer se conecta a stream, enviar stats con id + ip

  axios.post(`${process.env.API_URL}/metrics`, {
    channelId: args.channelId,
    userId: args.userId,
    mediaId: args.mediaId,
    type: 'view',
    value: 1,
  })
  .then((data) => {
    console.log('view ok')
  })
  .catch((err) => {
    console.log('error view')
    //console.log(err, 'error disconnecting')
  })
  //console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on('postPlay', (id, StreamPath, args) => {
  console.log('POST PLAY')
  //console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePlay', (id, StreamPath, args) => {
  console.log('DONE PLAY')
  // viewer denegado
  //console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});