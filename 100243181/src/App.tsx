import React, { useState } from 'react';

// 领取页面组件
const NFTClaimPage: React.FC = () => {
  // 定义登录状态
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // 定义领取次数状态
  const [claimCount, setClaimCount] = useState<number>(0);

  // 处理登录按钮点击事件
  const handleLogin = () => {
    // 在此处添加登录逻辑，这里只是简单地将登录状态切换为 true
    setIsLoggedIn(true);
  };

  // 处理领取 NFT 的逻辑
  const handleClaimNFT = () => {
    // 如果用户未登录，则提示用户先登录
    if (!isLoggedIn) {
      alert('请先登录！');
      return;
    }
    // 如果已经领取了超过10次，提示NFT已售空
    if (claimCount >= 10) {
      alert('NFT已售空！');
      return;
    }
    // 更新领取次数
    setClaimCount(prevCount => prevCount + 1);
    // 可以在这里执行领取 NFT 的逻辑
    console.log('领取 NFT 成功！');
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {/* 登录按钮 */}
      {!isLoggedIn && (
        <button style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={handleLogin}>
          登录
        </button>
      )}

      {/* 页面内容 */}
      <h1>领取 NFT</h1>
      {/* 显示用户登录状态 */}
      <p>{isLoggedIn ? '已登录' : '未登录'}</p>
      {/* 领取按钮 */}
      <div>
        <button onClick={handleClaimNFT}>领取 NFT</button>
        <p>已领取次数：{claimCount}</p>
      </div>
    </div>
  );
};

export default NFTClaimPage;

