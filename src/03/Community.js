import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Left from '../Compo/Left';
import './community.css';
import Footer from '../Compo/Footer.js';

function Community() {
  const [boards, setBoards] = useState([]);
  const [user, setUser] = useState(null); // 로그인된 사용자 정보를 상태로 저장
  const [loading, setLoading] = useState(true);
  const [loginMessage, setLoginMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태 추가
  const navigate = useNavigate();

  const checkSession = async () => {
    try {
      const response = await fetch('http://localhost:8080/checkSession', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.username);
        setLoginMessage(`${data.username}님, 반갑습니다!`);
        return true; // 로그인 성공 시 true 반환
      } else if (response.status === 401) {
        setUser(null);
        setLoginMessage('로그인 정보가 없습니다. 다시 로그인 해주세요.');
        return false; // 로그인 실패 시 false 반환
      } else {
        setUser(null);
        setLoginMessage('세션 확인 중 문제가 발생했습니다.');
        return false;
      }
    } catch (error) {
      console.error('세션 확인 실패:', error);
      setUser(null);
      setLoginMessage('세션 확인 중 오류가 발생했습니다.');
      return false;
    }
  };

  const fetchBoards = async () => {
    try {
      const response = await fetch('http://localhost:8080/community');

      if (response.ok) {
        const data = await response.json();
        setBoards(data);
      } else {
        console.error('게시글 데이터 가져오기 실패:', response.status);
        setErrorMessage('게시글 데이터 가져오기 실패');
      }
    } catch (error) {
      console.error('게시글 데이터 가져오기 실패:', error);
      setErrorMessage('게시글 데이터 가져오기 실패');
    }
  };

  const fetchData = async () => {
    setLoading(true); // 로딩 상태 시작

    await checkSession();
    await fetchBoards();

    setLoading(false); // 로딩 상태 종료
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) {
      return {
        date: 'Unknown Date',
        time: 'Unknown Time'
      };
    }

    const formattedDate = dateObj.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = dateObj.toLocaleTimeString('ko-KR');

    return {
      date: formattedDate,
      time: formattedTime
    };
  };

  const handleBoardClick = (boardId) => {
    if (boardId) {
      navigate(`/community/${boardId}`);
    } else {
      console.error('Invalid board ID');
    }
  };

  async function handleWriteClick() {
    if (user) {
      navigate("/community/write");
    } else {
      const loggedIn = await checkSession(); // 로그인 상태를 다시 확인
      if (loggedIn) {
        navigate("/community/write"); // 세션 확인 후 바로 글쓰기 페이지로 이동
      } else {
        alert("로그인 후에 게시글을 작성할 수 있습니다.");
      }
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="fixed left-0 top-0 w-1/6 h-full z-10">
        <Left />
      </div>
      <div className="flex-1 ml-[15%] mr-[10%] p-10 z-0">
        <div className="font-bold text-2xl mt-6" style={{ fontSize: '1.2rem' }}>
          너도 아파? 나도 아파!
        </div>
        <div className='mt-6'>
          <h1 style={{ fontSize: '0.9rem' }}>- 게시글의 제목을 선택하면 상세정보를 확인하실 수 있습니다.</h1>
          <h1 style={{ fontSize: '0.9rem' }}>- 로그인 후, 게시글을 작성할 수 있습니다.</h1>
          <h1 style={{ fontSize: '0.9rem' }}>- 게시글의 작성자 본인 및 관리자만 해당 게시글을 수정 및 삭제할 수 있습니다.</h1>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="text-center px-6 py-3">번호</th>
              <th scope="col" className="text-center px-6 py-3">제목</th>
              <th scope="col" className="text-center px-6 py-3">작성자</th>
              <th scope="col" className="text-center px-6 py-3">작성일</th>
            </tr>
          </thead>
          <tbody>
            {boards.map((board, index) => {
              const { date, time } = formatDate(board.createDate);
              return (
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={board.boardId}>
                  <td className="text-center">{index + 1}</td>
                  <td className="cursor-pointer" onClick={() => handleBoardClick(board.boardId)}>
                    {board.title}
                  </td>
                  <td className="text-center">{board.member.username}</td>
                  <td className="text-center">
                    <div>{date}</div>
                    <div>{time}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-end">
          <button className="sign-button mb-16" onClick={handleWriteClick}>
            글쓰기
          </button>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default Community;
