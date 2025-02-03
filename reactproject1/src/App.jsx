import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import * as d3 from "d3";
import { parseDate } from "./parseUtils";
import UserList from "./components/UserList"
import Timeline from "./components/Timeline";
import EventModal from "./components/EventModal";
import "./App.css";

Modal.setAppElement("#root");

const App = () => {
    const [events, setEvents] = useState([
        //{ id: 1, date: "0100-01-01 00:00:00", description: "test100", level:0 },
        //{ id: 2, date: "0-01-01 00:00:00", description: "Start of AC", level:0 },
        //{ id: 3, date: "BC 0100-01-01 00:00:00", description: "BC 100", level:0 },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [users, setUsers] = useState([]);
        
    const [isVertical, setIsVertical] = useState(false); // Ÿ�Ӷ��� ���� ���� �߰�

    const svgRef = useRef();
    const containerRef = useRef(); // ��ũ�� �����̳� ����
    const zoomBehaviorRef = useRef();
    //const baseWidth = 800; // �⺻ Ÿ�Ӷ��� �ʺ�
    //const baseEventSpacing = 200; // �̺�Ʈ �� �⺻ ����
    const serverurl = "http://localhost:5001";

    useEffect(() => {
        axios
        .get(serverurl + "/users")
        .then((response) => {
            setUsers(response.data);
        })
        .catch((error) => {
            console.error("Error fetching users:", error);
        });
    }, []); // �� �迭�� �־� ó�� ������ �� �� ���� ����

    useEffect(() => {
        axios
        .get(serverurl + "/events")
        .then((response) => {
            const sortedEvents = [...response.data].sort((a, b) => parseDate(a.createdt) - parseDate(b.createdt));
            if (JSON.stringify(events) !== JSON.stringify(sortedEvents)) {
                setEvents(sortedEvents); // ���ĵ� ������ ����
            }
        })
        .catch((error) => {
            console.error("Error fetching events:", error);
        });
    }, []); // �� �迭�� �־� ó�� ������ �� �� ���� ����

    const toggleDirection = () => setIsVertical((prev) => !prev); // ���� ��ȯ �Լ�

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div>
            <h1>Timeline History</h1>
            <UserList serverurl={serverurl} users={users} setUsers={setUsers} />
            <div style={{ marginBottom: "10px" }}>
                <button onClick={toggleDirection}>
                    Switch to {isVertical ? "Horizontal" : "Vertical"} Timeline
                </button>
            </div>
            <Timeline svgRef={svgRef}
                containerRef={containerRef}
                zoomBehaviorRef={zoomBehaviorRef}
                events={events}
                isVertical={isVertical}
            />
            <EventModal isModalOpen={isModalOpen}
                closeModal={closeModal}
                openModal={openModal}
                events={events}
                setEvents={setEvents}
                serverurl={serverurl}
                containerRef={containerRef}
            />            
        </div>
    );
};

export default App;