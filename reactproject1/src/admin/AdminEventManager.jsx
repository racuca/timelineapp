import React from "react";
import { useState } from "react";
import axios from "axios";
import { convertDateToStr } from "../parseUtils";


/* event 입력 예제
[
    {
        "createdt": "BC 9999-01-01 00:00:00",
        "title": "기록되지 않은 선사 시대",
        "description": "이 시기는 인류의 문명이 형성되기 전으로, 구석기 시대 후반에 해당한다.",
        "level": 0,
        "userid": 0
    },
]
*/

const EventManagement = ({ serverurl }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editcreatedt, setEditDate] = useState("");
    const [editTitle, setEditTitle] = useState("");
    const [description, setEditDescription] = useState("");
    const [editLevel, setEditLevel] = useState(0);
    const [edituserid, setEditUserid] = useState("");
    const [editCategory, setEditCategory] = useState(0);
    const [jsonData, setJsonData] = useState("");
    

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
        setEditCategory(event.category);
    };

    const handleSave = (id) => {
        const edituser = { createdt: editcreatedt, title: editTitle, description: description, level: editLevel, userid: edituserid, category: editCategory }
        axios.post(serverurl + "/admin/events/edit/" + id, edituser)
            .then((response) => {
                setEditingEvent(null);
            }).catch((error) => {
                console.error("Error updating event:", error);
            });;
    };

    const handleAddEvent = () => {
        try {
            const parsedData = JSON.parse(jsonData);
            axios.post(serverurl + "/admin/events/add/", parsedData)
                .then((response) => {
                    setJsonData(null);
                    alert("데이터가 성공적으로 저장되었습니다!");
                }).catch((error) => {
                    console.error("Error updating event:", error);
                });;
        } catch (error) {
            alert("유효한 JSON 데이터를 입력하세요.");
            console.error(error);
        }
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
                            <th>category</th>
                            <th>수정</th>
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
                                <td>{event.description}</td>
                                <td>{editingEvent == event.id ? (
                                    <input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="border p-1 w-auto min-w-[100px]" />
                                ) : (event.category)}</td>                                
                                <td>{editingEvent == event.id ? (
                                    <button onClick={() => handleSave(event.id)}>Save</button>
                                ) : (
                                    <button onClick={() => handleEdit(event)}>Edit</button>
                                )} </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">역사 데이터 저장</h2>
                    <div>
                        <textarea
                        rows="10" cols="50"
                        className="w-full h-60 p-2 border rounded-md"
                        value={jsonData}
                        onChange={(e) => setJsonData(e.target.value)}
                        placeholder='JSON 데이터를 입력하세요'
                        />
                    </div>
                    <button className="mt-4" onClick={handleAddEvent}>
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventManagement;