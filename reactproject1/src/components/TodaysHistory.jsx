import React, { useEffect, useState } from "react";
import axios from "axios";
//import Modal from "react-modal";
//import { parseDate } from "../parseUtils";
import Cookies from "js-cookie";

const TodaysHistory = ({ serverurl }) => {

    const [todayevents, setTodayevents] = useState([]);

    useEffect(() => {
        const storedUser = Cookies.get("user");
        let userobj = undefined;
        if (storedUser) {
            userobj = JSON.parse(storedUser);
        }

        // query Today events
        axios
            .get(serverurl + "/todayevents", {
                params: {
                    userid: userobj ? userobj["id"] : "null",
                }
            })
            .then((response) => {                                
                    setTodayevents(response);
            })
            .catch((error) => {
                console.error("Error fetching Today events:", error);
            });
        
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
