document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const autoModeSwitch = document.getElementById('autoMode');
    const modeText = document.getElementById('modeText');
    const manualTrigger = document.getElementById('manualTrigger');
    const autoAnswer = document.getElementById('autoAnswer');
    const statusDiv = document.getElementById('status');

    let isAutoAnswering = false;

    // 自动答题按钮点击事件
    autoAnswer.addEventListener('click', function() {
        if (!isAutoAnswering) {
            // 开始自动答题
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'startAutoAnswer'
                    }, function(response) {
                        if (response && response.success) {
                            isAutoAnswering = true;
                            autoAnswer.textContent = '停止自动答题';
                            autoAnswer.style.backgroundColor = '#ff4444';
                            updateStatus('自动答题进行中...');
                        }
                    });
                }
            });
        } else {
            // 停止自动答题
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'stopAutoAnswer'
                    }, function(response) {
                        if (response && response.success) {
                            isAutoAnswering = false;
                            autoAnswer.textContent = '开始自动答题';
                            autoAnswer.style.backgroundColor = '#2196F3';
                            updateStatus('自动答题已停止');
                        }
                    });
                }
            });
        }
    });

    // 手动答题按钮点击事件
    manualTrigger.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'manualAnswer'
                }, function(response) {
                    if (response && response.success) {
                        updateStatus('手动答题完成');
                        setTimeout(() => updateStatus('待机中'), 2000);
                    }
                });
            }
        });
    });

    // 更新状态显示
    function updateStatus(message) {
        statusDiv.textContent = '状态: ' + message;
    }

    // 初始化状态
    updateStatus('待机中');
});