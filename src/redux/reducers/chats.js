import { PUSH_MESSAGE, READ_ROOM } from "../actionTypes";
import store from "../store";
import { CHANNELS } from "../../channels";
import dataApp from "../../dataApp.js";

const initialState = {
  rooms: {},
  timeline: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    case PUSH_MESSAGE: {
      let message = action.payload;

      if(! initialState.rooms[message.roomId]){
        initialState.rooms[message.roomId] = {
          roomId: message.roomId,
          messages: [],
          lastMessage: null,
          unread: {
            [CHANNELS.VK]: 0,
            [CHANNELS.OK]: 0,
            [CHANNELS.FB]: 0,
            [CHANNELS.ALL]: 0
          }
        };
      }

      initialState.rooms[message.roomId].messages.push({
        channelId: message.channelId,
        body: message.body,
        ts: message.ts,
        autor: message.autor || message.roomId
      })

      if(initialState.timeline[0] != message.roomId){
        let findIndex = initialState.timeline.findIndex(roomId => roomId === message.roomId);

        if(findIndex != -1) initialState.timeline.splice(findIndex, 1);


        initialState.timeline.unshift(message.roomId);
      }

      if(dataApp.selectRoomId != null && initialState.timeline[0] != dataApp.selectRoomId){
        let findIndex = initialState.timeline.findIndex(roomId => roomId === dataApp.selectRoomId);

        if(findIndex != -1) initialState.timeline.splice(findIndex, 1);

        initialState.timeline.unshift(dataApp.selectRoomId);
      }

      initialState.rooms[message.roomId].lastMessage = initialState.rooms[message.roomId].messages[initialState.rooms[message.roomId].messages.length-1];

      dataApp.rooms = initialState.rooms;
      dataApp.roomsTimeline = initialState.timeline;

      if(
        dataApp.selectRoomId != message.roomId ||
        dataApp.selectChannelId != initialState.rooms[message.roomId].lastMessage.channelId &&
        dataApp.selectChannelId != CHANNELS.ALL
      ){
        initialState.rooms[message.roomId].unread[initialState.rooms[message.roomId].lastMessage.channelId] += 1;
        initialState.rooms[message.roomId].unread[CHANNELS.ALL] += 1;
        dataApp.unreadMessages += 1;
      }
      
      return {
        ...initialState
      };
    }
    case READ_ROOM: {
      const { roomId } = action.payload;

      if(initialState.timeline[0] != roomId){
        let findIndex = initialState.timeline.findIndex(searchRoomId => searchRoomId === roomId);

        if(findIndex != -1) initialState.timeline.splice(findIndex, 1);

        initialState.timeline.unshift(roomId);
      }

      dataApp.selectRoomId = roomId;

      if(dataApp.selectChannelId == CHANNELS.ALL){
        dataApp.unreadMessages -= initialState.rooms[roomId].unread[CHANNELS.ALL];
        for(var channel in initialState.rooms[roomId].unread){
          initialState.rooms[roomId].unread[channel] = 0;
        }
      }else{
        initialState.rooms[roomId].unread[CHANNELS.ALL] -= initialState.rooms[roomId].unread[dataApp.selectChannelId];
        dataApp.unreadMessages -= initialState.rooms[roomId].unread[dataApp.selectChannelId];
        initialState.rooms[roomId].unread[dataApp.selectChannelId] = 0;
      }
      
      return {
        ...initialState
      };
    }
    default:
      return state;
  }
}