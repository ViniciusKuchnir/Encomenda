const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const models = require('./models');
const QRCode = require('qrcode');
const {Expo} = require('expo-server-sdk');
const exphbs = require('express-handlebars');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('assets'));
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
let user = models.User;
let tracking = models.Tracking;
let product = models.Product;
let token = models.Token;
let expo = new Expo();




app.post('/login',async (req,res)=>{
    let response=await user.findOne({
        where:{name:req.body.name, password: req.body.password}
    });
    if(response === null){
        res.send(JSON.stringify('error'));
    }else{
        res.send(response);
    }
});

app.post('/verifyPass',async  (req,res)=>{
    let response=await user.findOne({
        where:{id:req.body.id, password: req.body.senhaAntiga}
    });
    if(response === null){
        res.send(JSON.stringify('Senha antiga não confere'));
    }else{
        if (req.body.novaSenha === req.body.confNovaSenha) {
            response.password = req.body.novaSenha;
            response.save();
            res.send(JSON.stringify('Senha atualizada com sucesso!'));
        }else{
            res.send(JSON.stringify('Nova senha e Confirmação não conferem!'))
        }
    }
});

//Criação do produto no bancos 
app.post('/create', async (req, res)=>{
    let trackingId='';
    await tracking.create({
        userId: req.body.userId,
        code: req.body.code,
        local: req.body.local,
    }).then((response)=>{
        trackingId+=response.id
    });

    await product.create({
        trackingId: trackingId,
        name: req.body.product
    });

    QRCode.toDataURL(req.body.code).then((url) =>{
        QRCode.toFile(
            './assets/img/code.png',
            req.body.code
        );
        res.send(JSON.stringify(url));
    })
});

//Pegar dados do produto
app.post('/searchProduct', async (req,res)=>{
    let response=await tracking.findOne({
        include: [{model: product}],
        where: {code: req.body.code},
        required: false
    });
    res.send(JSON.stringify(response));
});

//Update dos dados da mercadoria
app.post('/update', async (req,res)=>{
    let response=await tracking.findOne({
        where: {code: req.body.code},
        include: [{all:true}]
    });
    response.local=req.body.local;
    response.updatedAt=new Date();
    response.Products[0].name=req.body.product;
    response.save();
    response.Products[0].save();
    res.send(JSON.stringify('Dados foram atualizados com sucesso!'));
 });

 app.post('/rastreio', async(req, res)=>{
    let response = await tracking.findOne({
        where: {code: req.body.code},
        include: [{all:true}]
    });
    if(response === null){
        res.send(JSON.stringify('Nenhum produto encontrado!'));
    }else{
        res.send(JSON.stringify(`Sua encomenda ${response.Products[0].name} já está a caminho ${response.local}.`));
    }
 });

//Grava o Token no banco
app.post('/token', async (req, res) =>{
    let response = await token.findOne({
        where: {token: req.body.token}
    });
    if (response == null) {
        token.create({
            token: req.body.token,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
});

/*A notificação é enviada, porém aparece apenas um dia após no aparelho móvel*/

//Envio das notificações
app.post('/notifications',async (req, res) =>{
    // Create the messages that you want to send to clients
let messages = [];
let somePushTokens=[];

if (req.body.recipient == null) {
    let response = await token.findAll({
        raw: true
    });
    
    response.map((elem, ind, obj)=>{
        somePushTokens.push(elem.token);
    })
}else{
    somePushTokens.push(req.body.recipient);
}



for (let pushToken of somePushTokens) {
  // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    continue;
  }

  // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
  messages.push({
    to: pushToken,
    sound: 'default',
    title: req.body.title,
    body: req.body.message,
  })
}

// The Expo push notification service accepts batches of notifications so
// that you don't need to send 1000 requests to send 1000 notifications. We
// recommend you batch your notifications to reduce the number of requests
// and to compress them (notifications with similar content will get
// compressed).
let chunks = expo.chunkPushNotifications(messages);
let tickets = [];
(async () => {
  // Send the chunks to the Expo push notification service. There are
  // different strategies you could use. A simple one is to send one chunk at a
  // time, which nicely spreads the load out over time:
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
      // NOTE: If a ticket contains an error code in ticket.details.error, you
      // must handle it appropriately. The error codes are listed in the Expo
      // documentation:
      // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
    } catch (error) {
      console.error(error);
    }
  }
})();

// Later, after the Expo push notification service has delivered the
// notifications to Apple or Google (usually quickly, but allow the the service
// up to 30 minutes when under load), a "receipt" for each notification is
// created. The receipts will be available for at least a day; stale receipts
// are deleted.
//
// The ID of each receipt is sent back in the response "ticket" for each
// notification. In summary, sending a notification produces a ticket, which
// contains a receipt ID you later use to get the receipt.
//
// The receipts may contain error codes to which you must respond. In
// particular, Apple or Google may block apps that continue to send
// notifications to devices that have blocked notifications or have uninstalled
// your app. Expo does not control this policy and sends back the feedback from
// Apple and Google so you can handle it appropriately.
let receiptIds = [];
for (let ticket of tickets) {
  // NOTE: Not all tickets have IDs; for example, tickets for notifications
  // that could not be enqueued will have error information and no receipt ID.
  if (ticket.id) {
    receiptIds.push(ticket.id);
  }
}

let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
(async () => {
  // Like sending notifications, there are different strategies you could use
  // to retrieve batches of receipts from the Expo service.
  for (let chunk of receiptIdChunks) {
    try {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      console.log(receipts);

      // The receipts specify whether Apple or Google successfully received the
      // notification and information about an error, if one occurred.
      for (let receiptId in receipts) {
        let { status, message, details } = receipts[receiptId];
        if (status === 'ok') {
          continue;
        } else if (status === 'error') {
          console.error(
            `There was an error sending a notification: ${message}`
          );
          if (details && details.error) {
            // The error codes are listed in the Expo documentation:
            // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            // You must handle the errors appropriately.
            console.error(`The error code is ${details.error}`);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
})();
})

//View de envio de mensagens 
app.get('/', async (req, res) => {
    let response = await token.findAll({
        raw: true
    })
    res.render('mensagem', {users: response});
    
});

let port= process.env.PORT || 3000;
app.listen(port, (req, res) =>{
    console.log(`Servidor rodando na porta ${port}`)
})