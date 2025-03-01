import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { parseDate } from "../parseUtils";
import Cookies from "js-cookie";

const TodaysHistory = ({ serverurl }) => {

    const [todayevents, setTodayevents] = useState([]);

    useEffect(() => {

        const now = new Date();
        // query Today events
        setTodayevents(null);


    }, []); // 빈 배열을 넣어 처음 렌더링 시 한 번만 실행



    return (        
        <div>
            {todayevents ? (
                <p>Todays History is ...</p>
            ) : (
                <p>Nothing to happen...ㅠㅠ</p>
            )}
        </div>
    );

};

export default TodaysHistory;
