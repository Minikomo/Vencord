/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import { addServerListElement, removeServerListElement, ServerListRenderPosition } from "@api/ServerList";
import { definePluginSettings } from "@api/Settings";
import { Link } from "@components/Link";
import { Devs } from "@utils/constants";
import { Margins } from "@utils/margins";
import { ModalProps, ModalRoot, openModal } from "@utils/modal";
import definePlugin, { OptionType } from "@utils/types";
import { Button, Forms, React } from "@webpack/common";

import WebUntisAPI from "./api/untisApi";



interface ActivityAssets {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
}

interface Activity {
    state?: string;
    details?: string;
    timestamps?: {
        start?: number;
        end?: number;
    };
    assets?: ActivityAssets;
    buttons?: Array<string>;
    name: string;
    application_id: string;
    metadata?: {
        button_urls?: Array<string>;
    };
    type: ActivityType;
    url?: string;
    flags: number;
}

const enum ActivityType {
    PLAYING = 0,
    STREAMING = 1,
    LISTENING = 2,
    WATCHING = 3,
    COMPETING = 5
}

const enum TimestampMode {
    NONE,
    NOW,
    TIME,
    CUSTOM,
}



const settings = definePluginSettings({
    Key: {
        type: OptionType.STRING,
        name: "Key",
        description: "Your user key (required)",
        defaultValue: "XXXXXXXXXXXXXXXX"
    },
    School: {
        type: OptionType.STRING,
        name: "School",
        description: "Your school name (required)",
        defaultValue: "your-school"
    },
    UntisUsername: {

        type: OptionType.STRING,
        name: "Username for untis",
        description: "Its your untis username",
        defaultValue: "your-username"
    },
    Untisver: {
        type: OptionType.STRING,
        name: "Untis Server",
        description: "Your untis server ONLY USE THE SUBDOMAIN",
        defaultValue: "arche",
        default: "arche"
    },
    UntisType: {
        type: OptionType.SELECT,
        description: "What time table do you want to use",
        options: [
            {
                label: "Student",
                value: "STUDENT",
                default: true
            },
            {
                label: "Class",
                value: "CLASS"
            },
            {
                label: "Room",
                value: "ROOM"
            }
        ]
    },
    AppID: {
        type: OptionType.STRING,
        name: "App ID",
        description: "Your Discord Bot application ID (required for Discord RPC)",
        defaultValue: ""
    },
    EnableDiscordRPC: {
        type: OptionType.BOOLEAN,
        name: "Enable Discord RPC",
        description: "Show your current lesson for others on Discord in the Rich Presence",
        defaultValue: true,
        default: true,
        onChange: onChange
    },
    type: {
        type: OptionType.SELECT,
        description: "Activity type",
        onChange: onChange,
        options: [
            {
                label: "Playing",
                value: ActivityType.PLAYING,
                default: true
            },
            {
                label: "Streaming",
                value: ActivityType.STREAMING
            },
            {
                label: "Listening",
                value: ActivityType.LISTENING
            },
            {
                label: "Watching",
                value: ActivityType.WATCHING
            },
            {
                label: "Competing",
                value: ActivityType.COMPETING
            }
        ]
    },
    Name: {
        type: OptionType.STRING,
        name: "Name",
        defaultValue: "{lesson}",
        default: "{lesson}",
        description: "The name of the activity"
    },
    Description: {
        type: OptionType.STRING,
        name: "Description",
        defaultValue: "In room {room}",
        default: "In room {room}",
        description: "The description of the activity"
    }
});

function onChange() {
    dispatchActivityUpdate();
}


function dispatchActivityUpdate() {
    // try {
    //     FluxDispatcher.dispatch({
    //         type: "LOCAL_ACTIVITY_UPDATE",
    //         activity: {
    //             application_id: "",
    //             flags: 1,
    //             name: "Mathe",
    //             details: "In Raum 123",
    //             type: 2,
    //             timestamps: {
    //                 start: Date.now() - 1000 * 60 * 15,
    //                 end: Date.now() + 1000 * 60 * 30
    //             }
    //         },
    //         socketId: "CustomRPC",
    //     });
    // } catch (error) {
    //     console.error("Error fetching timetable:", error);
    // }
}

setInterval(dispatchActivityUpdate, 60000);

const handleButtonClick = async () => {

    openModal(props => <UntisModalContent rootProps={props} />);
};

const UntisButton = () => (
    <Button
        onClick={handleButtonClick}
        size={Button.Sizes.MIN}
        color={Button.Colors.CUSTOM}
        className="vc-untis-button"
    >
        <div className="vc-untis-button-content">
            <svg className="untis-button" viewBox="0 0 24 24" fill="currentColor">
                <path fill="currentColor" className="st0" d="M12,0C5.37,0,0,5.37,0,12s5.37,12,12,12,12-5.37,12-12S18.63,0,12,0ZM1.53,12.33v-.67h3.89v.67H1.53ZM4.83,19.64l-.47-.47,2.75-2.75.47.47-2.75,2.75ZM7.11,7.58l-2.75-2.75.47-.47,2.75,2.75-.47.47ZM12.33,22.47h-.67v-3.89h.67v3.89ZM19.17,19.64l-2.75-2.75.47-.47,2.75,2.75-.47.47ZM11,12V2.53c.39-.39.61-.61,1-1,.39.39.61.61,1,1v6.05l4.8-4.8h1.42v1.42l-4.8,4.8h7.05c.39.39.61.61,1,1-.39.39-.61.61-1,1h-10.47Z" />
            </svg>
        </div>
    </Button>
);

const UntisModalContent = ({ rootProps }: { rootProps: ModalProps; }) => {
    const [timetable, setTimetable] = React.useState<any[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const [timeGrid, setTimeGrid] = React.useState<any>(null);
    const [holidays, setHolidays] = React.useState<any>(null);
    const [currentDate, setCurrentDate] = React.useState<Date>(() => {
        const date = new Date();
        date.setHours(1, 0, 0, 0);
        return date;
    });

    const untis = new WebUntisAPI(
        settings.store.School || "defaultSchool",
        settings.store.UntisUsername || "defaultUsername",
        settings.store.Key || "defaultKey",
        settings.store.Untisver || "arche",
        settings.store.UntisType || "STUDENT"
    );

    React.useEffect(() => {
        const fetchTimetable = async () => {
            try {
                await untis.setUp();

                const timegrid = untis.getFullUntisIdData().masterData.timeGrid;
                setHolidays(untis.getFullUntisIdData().masterData.holidays);

                timegrid.days.forEach((day: any) => {
                    day.units.forEach((unit: any) => {
                        unit.start = unit.startTime.slice(1);
                        unit.end = unit.endTime.slice(1);
                    });
                });

                timegrid.days = timegrid.days.filter((day: any) => {
                    const isSaturday = day.day === "SAT";
                    const hasClasses = getPeriodsAtWeekday(6).length > 0;
                    return !isSaturday || hasClasses;
                });

                setTimeGrid(timegrid);

                const timetableData = await untis.getTimetable({
                    id: 1,
                    type: settings.store.UntisType as "STUDENT" | "CLASS" | "ROOM",
                    startDate: getMonday(currentDate).toISOString().split("T")[0],
                    endDate: getFriday(currentDate).toISOString().split("T")[0]
                });

                setTimetable(timetableData.periods);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                    console.error(error);
                } else {
                    setError(String(error));
                }
            }
        };

        fetchTimetable();
    }, [currentDate]);

    // Neuer useEffect-Hook zum Aktualisieren der Feiertage
    React.useEffect(() => {
        const fetchHolidays = async () => {
            try {
                await untis.setUp();
                setHolidays(untis.getFullUntisIdData().masterData.holidays);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                    console.error(error);
                } else {
                    setError(String(error));
                }
            }
        };

        fetchHolidays();
    }, [currentDate]);

    const handlePreviousWeek = () => {
        setTimetable([]);
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        newDate.setHours(1, 0, 0, 0);
        setCurrentDate(newDate);
    };

    const handleNextWeek = () => {
        setTimetable([]);
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        newDate.setHours(1, 0, 0, 0);
        setCurrentDate(newDate);
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTimetable([]);
        const newDate = new Date(event.target.value);
        newDate.setHours(1, 0, 0, 0);
        setCurrentDate(newDate);
    };

    const getMonday = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const getFriday = (date: Date) => {
        const d = getMonday(date);
        return new Date(d.setDate(d.getDate() + 4));
    };

    if (error) {
        return (<ModalRoot {...rootProps}>
            <div className="vc-untis-error">
                <div>{error}</div>
            </div>
        </ModalRoot>);
    }

    if (!timeGrid || !timetable) {
        return (<ModalRoot {...rootProps}>
            <div className="vc-untis-loading">
                <div>Loading...</div>
            </div>
        </ModalRoot>);
    }

    for (let i = 0; i < timeGrid.days.length; i++) {
        const day = timeGrid.days[i];
        const { units } = day;
        for (let j = 0; j < units.length - 1; j++) {
            const unit = units[j];
            const nextUnit = units[j + 1];
            if (unit.end === nextUnit.start) {
                const periodsAtCurrentTime = getPeriodsAtWeekdayAndTime(i + 1, unit.start);
                const periodsAtNextTime = getPeriodsAtWeekdayAndTime(i + 1, nextUnit.start);

                const sameSubjectAndRoom = periodsAtCurrentTime.every((period: any) =>
                    periodsAtNextTime.some((nextPeriod: any) =>
                        period.subjects[0].id === nextPeriod.subjects[0].id &&
                        period.rooms[0].id === nextPeriod.rooms[0].id &&
                        period.teachers[0].id === nextPeriod.teachers[0].id &&
                        period.classes[0].id === nextPeriod.classes[0].id
                    )
                );

                if (sameSubjectAndRoom) {
                    unit.end = nextUnit.end;
                    units.splice(j + 1, 1);
                    j--;
                }
            }
        }
    }

    const timeSlots = Array.from(
        new Set(
            timeGrid.days.flatMap((day: any) => day.units.map((unit: any) => unit.start))
        )
    ).sort();

    function getPeriodsAtWeekday(weekday: number) {
        return timetable.filter((period: any) => {
            const startDateTime = new Date(period.startDateTime);
            return startDateTime.getDay() === weekday;
        });
    }

    function getPeriodsAtWeekdayAndTime(weekday: number, time: string) {
        return timetable.filter((period: any) => {
            const startDateTime = new Date(period.startDateTime);
            const isRightWeekday = startDateTime.getDay() === weekday;
            const isBetweenStartAndEnd = period.startDateTime.split("T")[1].slice(0, 5) <= time && time < period.endDateTime.split("T")[1].slice(0, 5);
            return isRightWeekday && isBetweenStartAndEnd;
        });
    }

    function getHolidayByDateOfWeekWithWeekday(date: Date, weekday: number) {
        const monday = getMonday(date);
        const targetDate = new Date(monday);
        targetDate.setDate(monday.getDate() + weekday - 1);

        return holidays.find((holiday: any) => {
            const start = new Date(holiday.startDate);
            const end = new Date(holiday.endDate);
            return start <= targetDate && targetDate <= end;
        });
    }

    return (
        <ModalRoot className="vc-untis" {...rootProps}>
            <div className="vc-untis-modal">
                <div className="vc-untis-modal-content">

                    {/* change weeks */}
                    <div className="vc-untis-week">
                        <div className="vc-untis-week-button" onClick={handlePreviousWeek}>{"←"}</div>
                        <div className="vc-untis-week-text">
                            <input type="date" value={currentDate.toISOString().split("T")[0]} onChange={handleDateChange} className="vc-untis-week-input" id="date" />
                        </div>
                        <div className="vc-untis-week-button" onClick={handleNextWeek}>{"→"}</div>
                    </div>

                    <table className="vc-untis-timetable">
                        <thead>
                            <tr>
                                <th>Time</th>
                                {timeGrid.days.map((day: any, index: number) => {
                                    const date = new Date(getMonday(currentDate));
                                    date.setDate(date.getDate() + index);
                                    return (
                                        <th key={day.day}>{day.day} {date.getDate().toString().padStart(2, "0")}.{(date.getMonth() + 1).toString().padStart(2, "0")}</th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {(timeSlots as string[]).map((timeSlot: string) => (
                                <tr key={timeSlot as React.Key}>
                                    <td>
                                        <div>{`${String(timeSlot)} - ${timeGrid.days[0].units.find((unit: any) => unit.start === timeSlot)?.end || ""}`}</div>
                                    </td>
                                    {timeGrid.days.map((day: any, index: number) => (
                                        <td key={index + 1}>
                                            <div className="vc-untis-periods">
                                                {getPeriodsAtWeekdayAndTime(index + 1, timeSlot).map((period: any) => (
                                                    <div key={period.id} style={{ color: period.subjects?.[0]?.backColor || "#f1f1f1" }} className={`vc-untis-period ${period.is[0]} ${period.homeWorks.filter((homework: any) => homework.endDate === period.startDateTime.split("T")[0]).length > 0 ? "HOMEWORK" : ""} ${period.exam ? "EXAM" : ""}`
                                                    } onClick={() => openSingleLessonModal(period)}>
                                                        <div>
                                                            {period.subjects?.map((subject: any) => (
                                                                <div key={subject.id} title={subject.longName}>{subject.name}</div>
                                                            ))}
                                                        </div>
                                                        <div>
                                                            {period.teachers?.map((teacher: any) => (
                                                                <div key={teacher.id} title={teacher.longName}>{teacher.name}</div>
                                                            ))}
                                                        </div>
                                                        <div>
                                                            {period.rooms?.map((room: any) => (
                                                                <div key={room.id} title={room.longName}>{room.name}</div>
                                                            ))}
                                                        </div>
                                                        <div>
                                                            {period.classes?.map((class_: any) => (
                                                                <div key={class_.id} title={class_.longName}>{class_.name}</div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}

                                            </div>
                                            {getHolidayByDateOfWeekWithWeekday(currentDate, index + 1) && (
                                                <div className="vc-untis-holiday">
                                                    <div>{getHolidayByDateOfWeekWithWeekday(currentDate, index + 1).longName}</div>
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </ModalRoot>
    );
};


const SingleLessonModalContent = ({ rootProps, period }: { rootProps: ModalProps; period: any; }) => {

    return (
        <ModalRoot {...rootProps}>
            <div className="vc-untis-single-lesson">
                <h2>{period.subjects[0].name} ({period.subjects[0].longName})</h2>
                <p><b>Teacher:</b> {period.teachers.map((teacher: any) => `${teacher.name} (${teacher.longName})`).join(", ")}</p>
                <p><b>Room:</b> {period.rooms.map((room: any) => `${room.name} (${room.longName})`).join(", ")}</p>
                <p><b>Class:</b> {period.classes.map((class_: any) => (
                    <span key={class_.id} title={class_.longName}>{class_.name}</span>
                )).reduce((prev, curr) => [prev, ", ", curr])}</p>
                <p><b>Is:</b> {period.is[0]}</p>

                {period.text.lesson && (
                    <div className="vc-untis-single-lesson-text">
                        <h3>Lesson</h3>
                        <p>{period.text.lesson}</p>
                    </div>
                )}

                {period.text.substitution && (
                    <div className="vc-untis-single-lesson-text">
                        <h3>Substitution</h3>
                        <p>{period.text.substitution}</p>
                    </div>
                )}

                {period.text.info && (
                    <div className="vc-untis-single-lesson-text">
                        <h3>Info</h3>
                        <p>{period.text.info}</p>
                    </div>
                )}

                {period.homeWorks
                    .filter((homework: any) => homework.endDate === period.startDateTime.split("T")[0])
                    .length > 0 && (
                        <div className="vc-untis-single-lesson-homework">
                            <h3>Homeworks</h3>
                            {period.homeWorks
                                .filter((homework: any) => homework.endDate === period.startDateTime.split("T")[0])
                                .map((homework: any) => (
                                    <div key={homework.id}>
                                        <p>{homework.text}</p>
                                    </div>
                                ))}
                        </div>
                    )}
            </div>
        </ModalRoot>
    );
};

function openSingleLessonModal(period: any) {
    openModal(props => <SingleLessonModalContent rootProps={props} period={period} />);
}


export default definePlugin({
    name: "UntisAPI",
    description: "Show your current lesson in Discord",
    authors: [Devs.Leonlp9, Devs.minikomo],
    settings,
    dependencies: ["ServerListAPI"],

    renderUntisButton: UntisButton,

    start() {
        addServerListElement(ServerListRenderPosition.Above, this.renderUntisButton);
    },

    stop() {
        removeServerListElement(ServerListRenderPosition.Above, this.renderUntisButton);
    },

    settingsAboutComponent: () => {
        return (
            <>
                <Forms.FormDivider className={Margins.top8 + " " + Margins.bottom8} />

                <Forms.FormText>
                    <h2 style={{ fontWeight: "bold", fontSize: "18px" }} className={Margins.bottom8}>How to get "Key", "School", "Username" and "Untis Server":</h2>
                    Log in to your Untis account and open your profile at the bottom left. There, switch to "Freigaben" and click on "Anzeigen". You will now see all the data you need.
                    <img src="https://www.fmg-mg.de/wp-content/uploads/2023/01/Untis-logo-750x193.png" alt="" style={{ width: "100%" }} />
                </Forms.FormText>

                <Forms.FormDivider className={Margins.top8 + " " + Margins.bottom8} />

                <Forms.FormText>
                    <h2 style={{ fontWeight: "bold", fontSize: "18px" }} className={Margins.bottom8}>How to get "App ID":</h2>
                    Go to <Link href="https://discord.com/developers/applications">Discord Developer Portal</Link> to create an application and get the application ID.
                </Forms.FormText>

                <Forms.FormDivider className={Margins.top8} />

            </>
        );
    }
});
