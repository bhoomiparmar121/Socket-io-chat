import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesGateway } from './gateways/messages/messages.gateway';
import { RoomsController } from './controllers/rooms/rooms.controller';
import { MongooseModule } from "@nestjs/mongoose"; 
import { Message, MessageSchema } from './models/message.model';
import { Room, RoomSchema } from './models/room.model';
import { User, UserSchema } from './models/user.model';
import { MessagesController } from './controllers/messages/messages.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://0.0.0.0:27017/chat', {}), 
    MongooseModule.forFeature([
      {name: Message.name, schema: MessageSchema},
      {name: Room.name, schema: RoomSchema},
      {name: User.name, schema: UserSchema}
    ]), 
  ],
  controllers: [
    AppController,
    RoomsController,
    MessagesController,
  ],
  providers: [AppService, MessagesGateway],
})
export class AppModule {
}
