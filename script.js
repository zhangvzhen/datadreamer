// 确保 DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 1. 初始化变量
    const videoUploadArea = document.getElementById('videoUploadArea');
    const videoInput = document.getElementById('videoInput');
    const videoPreview = document.getElementById('videoPreview');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const submitBtn = document.getElementById('submitBtn');
    const promptText = document.getElementById('promptText');
    const resultContent = document.getElementById('resultContent');

    // 图片上传相关元素
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const imageUploadPlaceholder = document.getElementById('imageUploadPlaceholder');
    const imageClearBtn = document.getElementById('imageClearBtn');

    // 2. 工具函数
    function showToast(message, type = 'warning') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <svg class="toast-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);

        // 动画显示
        setTimeout(() => toast.classList.add('show'), 10);

        // 自动消失
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${content}
            </div>
        `;
        resultContent.appendChild(messageDiv);
        
        // 滚动到底部
        resultContent.scrollTop = resultContent.scrollHeight;
        
        return messageDiv;
    }

    function handleVideoFile(file) {
        const url = URL.createObjectURL(file);
        videoPreview.src = url;
        videoPreview.hidden = false;
        uploadPlaceholder.style.display = 'none';
        
        // 显示撤销按钮
        const clearBtn = document.getElementById('clearBtn');
        clearBtn.hidden = false;
        setTimeout(() => {
            clearBtn.classList.add('visible');
        }, 10);
    }

    function handleImageFile(file) {
        const url = URL.createObjectURL(file);
        imagePreview.src = url;
        imagePreview.hidden = false;
        imageUploadPlaceholder.style.display = 'none';
        
        imageClearBtn.hidden = false;
        setTimeout(() => {
            imageClearBtn.classList.add('visible');
        }, 10);
    }

    // 3. 事件监听器
    // 图片上传相关
    imageUploadArea.addEventListener('click', () => imageInput.click());
    imageUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUploadArea.style.borderColor = '#2196F3';
    });
    imageUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        imageUploadArea.style.borderColor = '#ccc';
    });
    imageUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUploadArea.style.borderColor = '#ccc';
        
        const files = e.dataTransfer.files;
        if (files.length && files[0].type.startsWith('image/')) {
            handleImageFile(files[0]);
        }
    });

    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleImageFile(e.target.files[0]);
        }
    });

    // 添加图片清除按钮点击事件
    imageClearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // 重置图片上传区域
        imagePreview.src = '';
        imagePreview.hidden = true;
        imageUploadPlaceholder.style.display = 'flex';
        
        // 隐藏清除按钮
        imageClearBtn.classList.remove('visible');
        setTimeout(() => {
            imageClearBtn.hidden = true;
        }, 300);
        
        // 清空文件输入
        imageInput.value = '';
    });

    // 处理视频上传
    videoUploadArea.addEventListener('click', () => {
        videoInput.click();
    });

    videoUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        videoUploadArea.style.borderColor = '#2196F3';
    });

    videoUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        videoUploadArea.style.borderColor = '#ccc';
    });

    videoUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        videoUploadArea.style.borderColor = '#ccc';
        
        const files = e.dataTransfer.files;
        if (files.length && files[0].type.startsWith('video/')) {
            handleVideoFile(files[0]);
        }
    });

    videoInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleVideoFile(e.target.files[0]);
        }
    });

    // 修改清除按钮的点击事件处理
    document.getElementById('clearBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        
        // 重置视频上传区域
        videoPreview.src = '';
        videoPreview.hidden = true;
        uploadPlaceholder.style.display = 'flex'; // 恢复显示上传提示
        
        // 隐藏撤销按钮
        const clearBtn = e.target.closest('.clear-btn');
        clearBtn.classList.remove('visible');
        setTimeout(() => {
            clearBtn.hidden = true;
        }, 300);
        
        videoInput.value = '';
    });

    // 修改提交按钮点击事件
    submitBtn.addEventListener('click', async () => {
        const hasVideo = videoPreview.src && !videoPreview.hidden;
        const hasImage = imagePreview.src && !imagePreview.hidden;

        if (!hasVideo && !hasImage) {
            showToast('请至少上传一张图片或一个视频后再提问', 'warning');
            videoUploadArea.classList.add('shake');
            imageUploadArea.classList.add('shake');
            setTimeout(() => {
                videoUploadArea.classList.remove('shake');
                imageUploadArea.classList.remove('shake');
            }, 650);
            return;
        }

        const question = promptText.value.trim();
        if (!question) {
            showToast('请输入提示词');
            return;
        }

        // 添加用户问题到聊天记录
        addMessage(question, 'user');

        // 显示加载状态
        submitBtn.disabled = true;
        const loadingMessage = addMessage(`
            <div class="loading">
                <div class="loading-spinner"></div>
                <span>AI正在分析${hasVideo ? '视频' : '图片'}...</span>
            </div>
        `, 'ai');

        try {
            // 模拟API响应
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 模拟的回答
            const mediaType = hasVideo ? '视频' : '图片';
            const simulatedAnswer = `这是一个关于${mediaType}的模拟AI回答......`;
            
            // 移除加载消息
            loadingMessage.remove();
            
            // 添加AI回答
            addMessage(simulatedAnswer, 'ai');
            
            // 清空输入框
            promptText.value = '';
            promptText.closest('.prompt-input').setAttribute('data-length', '0');
            
        } catch (error) {
            loadingMessage.remove();
            addMessage('抱歉，处理请求时出现错误，请稍后重试。', 'ai');
            showToast('请求失败，请检查网络连接', 'error');
        } finally {
            submitBtn.disabled = false;
        }
    });

    // 修改回车提交功能
    promptText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const hasVideo = videoPreview.src && !videoPreview.hidden;
            const hasImage = imagePreview.src && !imagePreview.hidden;

            if (!hasVideo && !hasImage) {
                showToast('请至少上传一张图片或一个视频后再提问', 'warning');
                videoUploadArea.classList.add('shake');
                imageUploadArea.classList.add('shake');
                setTimeout(() => {
                    videoUploadArea.classList.remove('shake');
                    imageUploadArea.classList.remove('shake');
                }, 650);
                return;
            }
            submitBtn.click();
        }
    });

    // 修改重新生成功能
    document.getElementById('regenerateBtn').addEventListener('click', async () => {
        const messages = resultContent.querySelectorAll('.chat-message');
        if (messages.length === 0) {
            showToast('没有可重新生成的内容');
            return;
        }

        // 获取最后一条用户消息
        let lastUserMessage = Array.from(messages)
            .reverse()
            .find(msg => msg.classList.contains('user'));

        if (!lastUserMessage) {
            showToast('没有找到上一个问题');
            return;
        }

        // 删除最后一条AI回答
        const lastAiMessage = messages[messages.length - 1];
        if (lastAiMessage.classList.contains('ai')) {
            lastAiMessage.remove();
        }

        // 重新生成回答
        const regenerateBtn = document.getElementById('regenerateBtn');
        regenerateBtn.disabled = true;
        
        const loadingMessage = addMessage(`
            <div class="loading">
                <div class="loading-spinner"></div>
                <span>正在重新生成...</span>
            </div>
        `, 'ai');

        try {

            // const newAnswer = await API.regenerateAnswer(question, previousAnswer);
            // loadingMessage.remove();
            // addMessage(newAnswer, 'ai');

            // 模拟API延迟
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 模拟的新回答
            const simulatedNewAnswer = "这是模拟重新生成的回答......";
            
            loadingMessage.remove();
            addMessage(simulatedNewAnswer, 'ai');
        } catch (error) {
            loadingMessage.remove();
            addMessage('重新生成失败，请稍后重试。', 'ai');
            showToast('重新生成请求失败', 'error');
        } finally {
            regenerateBtn.disabled = false;
        }
    });

    // 修改清空历史功能
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        // 清空聊天记录
        resultContent.innerHTML = '';
        promptText.value = '';
        promptText.closest('.prompt-input').setAttribute('data-length', '0');
        
        // 清空视频
        if (!videoPreview.hidden) {
            videoPreview.src = '';
            videoPreview.hidden = true;
            uploadPlaceholder.style.display = 'flex';
            const clearBtn = document.getElementById('clearBtn');
            clearBtn.classList.remove('visible');
            setTimeout(() => {
                clearBtn.hidden = true;
            }, 300);
            videoInput.value = '';
        }
        
        // 清空图片
        if (!imagePreview.hidden) {
            imagePreview.src = '';
            imagePreview.hidden = true;
            imageUploadPlaceholder.style.display = 'flex';
            imageClearBtn.classList.remove('visible');
            setTimeout(() => {
                imageClearBtn.hidden = true;
            }, 300);
            imageInput.value = '';
        }
    });

    // 添加输入框字数统计
    const maxLength = 500;
    promptText.addEventListener('input', () => {
        const length = promptText.value.length;
        promptText.closest('.prompt-input').setAttribute('data-length', length);
        
        if (length > maxLength) {
            promptText.value = promptText.value.slice(0, maxLength);
            showToast(`已超出${maxLength}字限制`);
        }
    });

    // 修改示例点击处理函数
    function setupExampleHandlers() {
        const exampleItems = document.querySelectorAll('.example-item');
        
        exampleItems.forEach(item => {
            item.addEventListener('click', () => {
                try {
                    const exampleVideo = item.querySelector('video');
                    const exampleImage = item.querySelector('.example-image img');
                    const examplePrompt = item.querySelector('.example-prompt').textContent;
                    
                    if (exampleVideo) {
                        // 处理视频示例
                        videoPreview.src = exampleVideo.src;
                        videoPreview.hidden = false;
                        uploadPlaceholder.style.display = 'none';
                        
                        // 显示视频清除按钮
                        const clearBtn = document.getElementById('clearBtn');
                        clearBtn.hidden = false;
                        setTimeout(() => {
                            clearBtn.classList.add('visible');
                        }, 10);
                    } else if (exampleImage) {
                        // 处理图片示例
                        imagePreview.src = exampleImage.src;
                        imagePreview.hidden = false;
                        imageUploadPlaceholder.style.display = 'none';
                        
                        // 显示图片清除按钮
                        imageClearBtn.hidden = false;
                        setTimeout(() => {
                            imageClearBtn.classList.add('visible');
                        }, 10);
                    }
                    
                    // 设置问题文本
                    promptText.value = examplePrompt;
                    
                    // 更新字数统计
                    const length = examplePrompt.length;
                    promptText.closest('.prompt-input').setAttribute('data-length', length);
                    
                    // 滚动到顶部
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                    
                    showToast('已复制示例到输入区域', 'success');
                    
                } catch (error) {
                    console.error('Error copying example:', error);
                    showToast('复制示例失败，请重试', 'error');
                }
            });
        });
    }

    setupExampleHandlers();

    // 4. API 交互
    const API = {
        baseUrl: 'http://your-backend-url.com/api', // 替换为实际的后端API地址

        // 发送视频和问题到后端
        async analyzeVideo(videoFile, question) {
            try {
                const formData = new FormData();
                formData.append('video', videoFile);
                formData.append('question', question);

                const response = await fetch(`${this.baseUrl}/analyze`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                return data.answer;
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        },

        // 重新生成答案
        async regenerateAnswer(question, previousAnswer) {
            try {
                const response = await fetch(`${this.baseUrl}/regenerate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        question,
                        previousAnswer
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                return data.answer;
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        }
    };
}); 