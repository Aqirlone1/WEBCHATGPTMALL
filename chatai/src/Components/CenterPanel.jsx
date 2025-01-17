import React, { useContext, useEffect, useState, useRef } from "react";

import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Context } from "../context/contextApi";
import { Button, Checkbox, Dropdown } from "antd";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import {
  FaMicrophoneAltSlash,
  FaCopy,
  FaMicrophone,
  FaRobot,
  FaUser,
  FaShare,
} from "react-icons/fa";
import PulseLoader from "react-spinners/PulseLoader";
import linkedInIcon from "../assets/linkedin.png";
import TypeWritter from "./TypeWritter";
import TextToSpeech from "./TextToSpeech";
import DropDownButton from "./DropDownButton";
import MyRoomHistory from "./MyRoomHistory";
import OrgCard from "./OrgCard";
import { getOrganizations } from "../apiCalls/getOrganizations";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { addFavourites } from "../apiCalls/favourites";
import Avatar from "antd/es/avatar/avatar";
import ShareModel from "./ShareModel";

export default function CenterNav() {
  
  const {
    active,
    setActive,
    searchQuery,
    setSearchQuery,
    openai_textToText,
    chatgptmall_textToText,
    chatgptmall_room_textToText,
    microsoft_textToText,
    setLanguage,
    setTranslate,
    responseInput,
    loading,
    response,
    setLoading,
    generateUniqueId,
    selectedApi,
    roomHistory,
    setresponse,
  } = useContext(Context);

  const params = useParams();
  const navigate = useNavigate();

  const divRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [customerSupport, setCustomerSupport] = useState(0);
  const [organizations, setOrganizations] = useState([]);
  const [isShareModelCompOpen,setIsShareModelCompOpen]=useState(false)
  const [activeShareId,setActiveShareId]=useState(null)
  

  const [convertedAudio, setConvertedAudio] = useState("false");

  let {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const onCopyClick = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link Copied", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (err) {
      toast.success("Something Went wrong", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };
  const getShareItems=(id)=>{
    const lHref = `https://www.linkedin.com/sharing/share-offsite/?url=http://homelinked.tech/${params.id}/history/details/${id}`;
    const historyResLink = `http://homelinked.tech/${params.id}/history/details/${id}`;
  const items = [
    {
      key: "1",
      label: (
        <a rel="noopener noreferrer" href={lHref} target="_blank">
          <img
            className="social-media-img"
            src={linkedInIcon}
            height={25}
            width={25}
            alt="linkedInIcon"
          ></img>
        </a>
      ),
    },
    {
      key: "2",
      label: (
        <span
        onClick={() => {
          onCopyClick(historyResLink);
        }}
        >
          <FaCopy
            color="rgb(145 146 160)"
            style={{ width: 25, height: 25 }}
          ></FaCopy>
        </span>
      ),
    },

    {
      key: "6",
      label: (
        <Avatar
          style={{ backgroundColor: "#87d068", verticalAlign: "middle" }}
          size={30}
          gap={0}
          onClick={()=>{setIsShareModelCompOpen(true);setActiveShareId(id)}}
          
        >
          {params.segment1[0]}
        </Avatar>
      ),
    },
  ];
return items
}
  if (!browserSupportsSpeechRecognition) {
    console.log(
      "Your browser does not support speech recognition software! Try Chrome desktop, maybe?"
    );
  }

  const copyContent = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log("Content copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const callApi = async (input) => {
    if (
      localStorage.getItem("selected_api") === "Openai" ||
      selectedApi === "Openai"
    ) {
      await openai_textToText(input);
    } else if (
      (localStorage.getItem("selected_api") === "Chatgptmall" ||
        selectedApi === "Chatgptmall") &&
      !localStorage.getItem("user_permission")
    ) {
      await chatgptmall_textToText(input);
    } else if (
      (localStorage.getItem("selected_api") === "Chatgptmall" ||
        selectedApi === "Chatgptmall") &&
      localStorage.getItem("user_permission")
    ) {
      await chatgptmall_room_textToText(input, customerSupport);
    } else if (
      localStorage.getItem("selected_api") === "Microsoft" ||
      selectedApi === "Microsoft"
    ) {
      await microsoft_textToText(input);
    } else {
      await microsoft_textToText(input);
    }
  };

  useEffect(() => {
    const userPermission = localStorage.getItem("user_permission");
    if (!userPermission) {
      navigate("/");
    } else {
      setActive(false);
    }
  }, []);

  useEffect(() => {
    const divElement = divRef.current;
    if (divElement) divElement.scrollTop = divElement?.scrollHeight;
  }, [roomHistory]);
  useEffect(() => {
    const divElement = divRef.current;
    if (divElement) divElement.scrollTop = divElement?.scrollHeight;
  }, [response]);

  useEffect(() => {
    setConvertedAudio(transcript);
  }, [transcript]);
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await getOrganizations();
      setLoading(false);
      setOrganizations(data);
    } catch (error) {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleHeartClick = async (data) => {
    try {
      await addFavourites({
        ...data,
        room_key: localStorage.getItem("room_key"),
      });
      const newResponse = response.map((res) => {
        if (res.history == data.history) {
          toast.success("Successfully added to Favourites", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
          return { ...res, is_favourite: true };
        } else {
          return res;
        }
      });
      setresponse(newResponse);

      // setLoading(false);
    } catch (error) {}
    // try {
    //   setLoading(true)
    //   await addFavourites({...data,room_key:localStorage.getItem("room_key")})
    //   setLoading(false)
    // } catch (error) {
    //   setLoading(false)

    // }
  };
  return (
    <>
      <ShareModel isShareModelCompOpen={isShareModelCompOpen} setIsShareModelCompOpen={setIsShareModelCompOpen} id={activeShareId} />
      <div className="center-nav">
        {loading && (
          <span className={`loader ${active ? "active" : ""}`}>
            {" "}
            <PulseLoader color="#ffffff" size={"10px"} />
          </span>
        )}
        {localStorage.getItem("user_permission") &&
          params.segment1 &&
          params.id && (
            <DropDownButton
              className={"translate"}
              setShowDropdown={setShowDropdown1}
              showDropDown={showDropdown1}
              setValue={setTranslate}
            ></DropDownButton>
          )}
        {localStorage.getItem("user_permission") &&
          params.segment1 &&
          params.id && (
            <DropDownButton
              className={"language"}
              setShowDropdown={setShowDropdown}
              showDropDown={showDropdown}
              setValue={setLanguage}
            ></DropDownButton>
          )}
        {!(
          localStorage.getItem("user_permission") ||
          localStorage.getItem("openAi_apiKey") ||
          localStorage.getItem("chatgptmall_apikey") ||
          (localStorage.getItem("microsoft_apikey") &&
            localStorage.getItem("microsoft_endpoint"))
        ) &&
          !loading && (
            <div className={`home-page text-center ${active ? "active" : ""}`}>
              <h2 className="text-center  mb-5 ">Welcome To Skybrain</h2>
              <div className="d-flex w-100  justify-content-center flex-wrap">
                {organizations?.map(({ name, category, image }, index) => {
                  return (
                    <OrgCard
                      title={name.length > 9 ? name.slice(0, 9) + "..." : name}
                      image={image}
                    ></OrgCard>
                  );
                })}
              </div>
            </div>
          )}
        {(localStorage.getItem("user_permission") ||
          localStorage.getItem("openAi_apiKey") ||
          localStorage.getItem("chatgptmall_apikey") ||
          (localStorage.getItem("microsoft_apikey") &&
            localStorage.getItem("microsoft_endpoint"))) && (
          <div
            id="chatbot"
            ref={divRef}
            className={`chatbot-ui ${active ? "active" : ""}`}
          >
            {!loading && responseInput.length < 1 && (
              <h2 className="text-center text-capitalize">
                {params.segment1 !== undefined
                  ? `Welcome to ${params.segment1}`
                  : "Text To Text"}
              </h2>
            )}

            {!loading && responseInput.length < 1 && params.id && (
              <h6 className="text-center  text-white text-capitalize mt-5">
                {params.id !== undefined && `Room No ${params.id}`}
              </h6>
            )}
            <span>|</span>
            {params.id && params.segment1 && <MyRoomHistory getShareItems={getShareItems} />}
            {response?.map((res) => {
              return (
                <div
                  key={generateUniqueId}
                  className="response c_response d-flex flex-column text-white"
                >
                  <div className="input">
                    {(loading || res.input.length > 0) && (
                      <div
                        className={`user-query d-flex align-items-center gap-4 py-2 ${
                          active ? "active" : ""
                        }`}
                      >
                        <span className="ps-3">
                          <FaUser></FaUser>
                        </span>
                        <span
                          className="response-input"
                          style={{ fontSize: "1rem" }}
                        >
                          {res.input}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="response-text  d-flex py-3 gap-4">
                    <span className="ps-3" style={{ fontSize: "1.5rem" }}>
                      {res.input && <FaRobot></FaRobot>}
                    </span>
                    <p>
                      <TypeWritter response={res.response} />
                    </p>
                    <span className="speaker">
                      <TextToSpeech text={res.response}></TextToSpeech>
                    </span>
                    <Button
                      type="link"
                      className="heart p-0"
                      onClick={() =>
                        handleHeartClick({
                          user_input: res.input,
                          response: res.response,
                          history: res.history,
                        })
                      }
                    >
                      {res.is_favourite ? (
                        <HeartFilled></HeartFilled>
                      ) : (
                        <HeartOutlined />
                      )}
                    </Button>
  

                    <Dropdown menu={{ items:getShareItems(res.history) }} placement="bottomLeft" arrow>
                      <Button
                        type="link"
                        className="share p-0"
                        
                      >
                        {<FaShare />}
                      </Button>
                    </Dropdown>

                    <span
                      onClick={() => {
                        copyContent(res.response);
                        toast.success("Copied to clipboard", {
                          position: "top-right",
                          autoClose: 2000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          theme: "dark",
                        });
                      }}
                      className="copy"
                    >
                      <FaCopy color="rgb(145 146 160)"></FaCopy>
                    </span>
                  </div>
                </div>
              );
            })}
            <div className={` search-bar mt-5 ${active ? "active" : ""}`}>
              <textarea
              rows={1}
              style={{maxHeight:70,background:"#343541",color:"white"}}
                type="text"
                placeholder="Type a message or type '/' to select prompt..."
                className="form-control shadow"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                value={searchQuery || convertedAudio}
                onKeyUp={(event) => {
                  if (event.key === "Enter") {
                    setLoading(true);
                    callApi(searchQuery);
                    setSearchQuery("");
                  }
                }}
              />

              <span
                onClick={() => {
                  setRecording(!recording);
                }}
                className="microphone"
              >
                {!listening ? (
                  <FaMicrophoneAltSlash
                    onClick={() => {
                      setSearchQuery("");
                      SpeechRecognition.startListening({ continuous: true });
                      resetTranscript();
                    }}
                    color="#ffffff"
                  ></FaMicrophoneAltSlash>
                ) : (
                  <FaMicrophone
                    onClick={() => {
                      SpeechRecognition.stopListening();
                      callApi(transcript);
                      setConvertedAudio("");
                    }}
                    color="#ffffff"
                  ></FaMicrophone>
                )}
              </span>
              {params.id && params.segment1 && (
                <Checkbox
                  className="position-absolute  "
                  style={{ right: -170, color: "white", bottom: 12 }}
                  onChange={(value) => {
                    value ? setCustomerSupport(1) : setCustomerSupport(0);
                  }}
                >
                  Ask For Support
                </Checkbox>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
