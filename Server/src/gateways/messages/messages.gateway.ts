import {OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Message } from '../../models/message.model';
import { User } from '../../models/user.model';
import { Room } from '../../models/room.model';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Server} from "socket.io";

@WebSocketGateway({cors: '*:*'})
export class MessagesGateway implements OnGatewayDisconnect {

  constructor(@InjectModel(Message.name) private readonly messagesModel: Model<Message>,
              @InjectModel(Room.name) private readonly roomsModel: Model<Room>,
              @InjectModel(User.name) private readonly usersModel: Model<User>) { 
  }

  @WebSocketServer()
  server: Server;

  async handleDisconnect(client: Socket) { 
    const user = await this.usersModel.findOne({clientId: client.id});
    if (user) {
      this.server.emit('users-changed', {user: user.nickname, event: 'left'});
      user.clientId = null;
      await this.usersModel.findByIdAndUpdate(user._id, user);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleRoomJoin(client: Socket, room: string) {
    let user = await this.roomsModel.findOne({name: room});
    if (!user) {
      user = await this.roomsModel.create({name: room , clientId: client.id});
    } else {
      user.clientId = client.id;
      user = await this.roomsModel.findByIdAndUpdate(user._id, user, {new: true});
    }
    client.join(room);
    client.emit('joinedRoom', room);
  }

  @SubscribeMessage('chatToServer')
  async handleMessage(
    client: Socket,
    message: {
      sender: string; room: string; roomId: string; message: string; created: string;
},
  ) {
    message.created = new Date(Date.now()).getHours() +":" + new Date(Date.now()).getMinutes()
    const newMsg = await this.messagesModel.create(message);
    let room = await this.roomsModel.updateOne({name: message.room}, { $push: { messages: newMsg }})
    this.server.to(message.room).emit('chatToClient', message);
  }

  @SubscribeMessage('typing')
  async typing(client: Socket, data){
    client.broadcast.emit("typingResponse", data)
  }

  @SubscribeMessage('upload')
  async uploadFile(client: Socket, file: string | NodeJS.ArrayBufferView){
   
  }

  // @SubscribeMessage('enter-chat-room') 
  // async enterChatRoom(client: Socket, data: { nickname: string, roomId: string }) {
  //   let user = await this.usersModel.findOne({nickname: data.nickname});
  //   if (!user) {
  //     user = await this.usersModel.create({nickname: data.nickname, clientId: client.id});
  //   } else {
  //     user.clientId = client.id;
  //     user = await this.usersModel.findByIdAndUpdate(user._id, user, {new: true});
  //   }
  //   client.join(data.roomId);
  //   client.broadcast.to(data.roomId)
  //     .emit('users-changed', {user: user.nickname, event: 'joined'}); 
  // }

  // @SubscribeMessage('leave-chat-room') 
  // async leaveChatRoom(client: Socket, data: { nickname: string, roomId: string }) {
  //   const user = await this.usersModel.findOne({nickname: data.nickname});
  //   client.broadcast.to(data.roomId).emit('users-changed', {user: user.nickname, event: 'left'}); 
  //   client.leave(data.roomId);
  // }

  // @SubscribeMessage('add-message') 
  // async addMessage(client: Socket, message: Message) {
  //   message.sender = await this.usersModel.findOne({clientId: client.id});
  //   message.created = new Date(Date.now()).getHours() +
  //   ":" +
  //   new Date(Date.now()).getMinutes(),
  //   message = await this.messagesModel.create(message);
  //   this.server.in(message.roomId as string).emit('message', message);
  // }
}
