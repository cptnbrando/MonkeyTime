package com.tugma.MonkeyTime.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.ArrayList;

@Controller
public class WebSocketController {

    private final SimpMessagingTemplate global;

    private ArrayList<String> allIDs = new ArrayList<>();

    @Autowired
    public WebSocketController(SimpMessagingTemplate global) {
        this.global = global;
    }

    /**
     * Sends a message to the global chatroom
     * Updates the global SimpMessagingTemplate object,
     * which gets updated for those subscribed to server/socket/message
     *
     * @param message text message to send
     */
    @MessageMapping("/send/message")
    public void sendMessage(String message) {
        this.global.convertAndSend("/message", message);
    }

    @MessageMapping("/send/id")
    public void addID(String id) {
        this.allIDs.add(id);
    }

    @GetMapping("/api/IDs")
    public ArrayList<String> getIDs() {
        return this.allIDs;
    }

}

