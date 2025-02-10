import React from "react";
import { useState } from "react";
import axios from "axios";
import { convertDateToStr } from "../parseUtils";


const EventManagement = ({ serverurl }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editcreatedt, setEditDate] = useState("");
    const [editTitle, setEditTitle] = useState("");
    const [description, setEditDescription] = useState("");
    const [editLevel, setEditLevel] = useState(0);
    const [edituserid, setEditUserid] = useState("");


    const handleSearch = () => {
        const query = serverurl + "/admin/events?search=" + `${searchTerm}`;
        axios.get(query)
            .then((response) => {
                setFilteredEvents(response.data)
            })
            .catch(error => {
                console.error("Error searching events:", error);
            });
    };

    const handleEdit = (event) => {
        setEditingEvent(event.id);
        setEditDate(event.createdt);
        setEditTitle(event.title);
        setEditDescription(event.description);
        setEditLevel(event.level);
        setEditUserid(event.userid);
    };

    const handleSave = (id) => {
        const edituser = { createdt: editcreatedt, title: editTitle, description: description, level: editLevel, userid: edituserid }
        axios.post(serverurl + "/admin/events/edit/" + id, edituser)
            .then((response) => {
                setEditingEvent(null);
            }).catch((error) => {
                console.error("Error updating event:", error);
            });;
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Event Management</h2>
            <div className="flex gap-2 mb-4">
                <input
                    placeholder="Search by title or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onInput={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
            </div>
            {/* 최근 추가된 이벤트 목록 */}
            <div className="recent-events">
                <h2>최근 추가된 이벤트</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>createdt</th>
                            <th>title</th>
                            <th>Level</th>
                            <th>userid</th>
                            <th>username</th>
                            <th>description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEvents.map(event => (
                            <tr key={event.id}>
                                <td>{event.id}</td>
                                <td>{editingEvent == event.id ? (
                                    <input value={editcreatedt} onChange={(e) => setEditDate(e.target.value)} className="border p-1 w-auto min-w-[100px]" />
                                ) : (convertDateToStr(event.createdt))}</td>
                                <td>{editingEvent == event.id ? (
                                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="border p-1 w-auto min-w-[100px]" />
                                ) : (event.title)}</td>
                                <td>{editingEvent == event.id ? (
                                    <input value={editLevel} onChange={(e) => setEditLevel(e.target.value)} className="border p-1 w-auto min-w-[100px]" />
                                ) : (event.level)}</td>
                                <td>{editingEvent == event.id ? (
                                    <input value={edituserid} onChange={(e) => setEditUserid(e.target.value)} className="border p-1 w-auto min-w-[100px]" />
                                ) : (event.userid)}</td>
                                <td>{event.name}</td>
                                <td>{editingEvent == event.id ? (
                                    <button onClick={() => handleSave(event.id)}>Save</button>
                                ) : (
                                    <button onClick={() => handleEdit(event)}>Edit</button>
                                )} </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EventManagement;