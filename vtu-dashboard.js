class VTUDashboard {
    constructor() {
        this.tonConnectUI = null;
        this.userWallet = null;
        this.aqcnxBalance = 0;
        this.transactionHistory = [];
        
        this.init();
    }
    
    async init() {
        console.log('Initializing VTU Dashboard...');
        
        // Initialize TonConnect
        this.tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
            manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json'
        });
        
        // Listen for wallet connection changes
        this.tonConnectUI.onStatusChange((wallet) => {
            console.log('Wallet status changed:', wallet);
            if (wallet) {
                this.handleWalletConnected(wallet);
            } else {
                this.handleWalletDisconnected();
            }
        });
        
        this.setupEventListeners();
        this.updateDisplay();
        this.initializeTabs();
    }
    
    setupEventListeners() {
        // Connect wallet button
        const connectBtn = document.getElementById('connect-wallet');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connectWallet());
        }
        
        // Disconnect button
        const disconnectBtn = document.getElementById('disconnect-btn');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnectWallet());
        }
        
        // Form submissions
        this.setupFormListeners();
    }
    
    setupFormListeners() {
        const forms = ['airtime-form', 'data-form', 'electricity-form', 'tv-form'];
        
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                form.addEventListener('submit', (e) => this.handleFormSubmit(e, formId));
            }
        });
    }
    
    async connectWallet() {
        try {
            console.log('Connecting wallet...');
            await this.tonConnectUI.connectWallet();
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            this.showError('Failed to connect wallet. Please try again.');
        }
    }
    
    async disconnectWallet() {
        try {
            console.log('Disconnecting wallet...');
            await this.tonConnectUI.disconnect();
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        }
    }
    
    async handleWalletConnected(wallet) {
        console.log('Wallet connected:', wallet);
        this.userWallet = wallet;
        
        // Simulate AQCNX balance fetch (replace with actual API call)
        await this.fetchAQCNXBalance();
        
        this.updateDisplay();
        this.showSuccess('Wallet connected successfully!');
    }
    
    handleWalletDisconnected() {
        console.log('Wallet disconnected');
        this.userWallet = null;
        this.aqcnxBalance = 0;
        this.updateDisplay();
        this.showInfo('Wallet disconnected');
    }
    
    async fetchAQCNXBalance() {
        // Simulate API call to fetch AQCNX balance
        // In a real implementation, this would call your backend API
        try {
            // Simulate random balance for demo
            // this.aqcnxBalance = Math.floor(Math.random() * 10000) + 500;
            console.log('AQCNX Balance fetched:', this.aqcnxBalance);
        } catch (error) {
            console.error('Failed to fetch AQCNX balance:', error);
            this.aqcnxBalance = 0;
        }
    }
    
    updateDisplay() {
        const connectBtn = document.getElementById('connect-wallet');
        const walletInfo = document.getElementById('wallet-info');
        const walletAddress = document.getElementById('wallet-address');
        const aqcnxBalance = document.getElementById('aqcnx-balance');
        
        if (this.userWallet) {
            // Hide connect button, show wallet info
            if (connectBtn) connectBtn.style.display = 'none';
            if (walletInfo) walletInfo.classList.remove('hidden');
            
            // Update wallet address (shortened)
            if (walletAddress) {
                const address = this.userWallet.account.address;
                const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
                walletAddress.textContent = shortAddress;
            }
            
            // Update balance
            if (aqcnxBalance) {
                aqcnxBalance.textContent = this.aqcnxBalance.toLocaleString();
            }
        } else {
            // Show connect button, hide wallet info
            if (connectBtn) connectBtn.style.display = 'block';
            if (walletInfo) walletInfo.classList.add('hidden');
            
            // Reset displays
            if (walletAddress) walletAddress.textContent = 'Not Connected';
            if (aqcnxBalance) aqcnxBalance.textContent = '0';
        }
    }
    
    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.service-form');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                const targetContent = document.getElementById(`${tabName}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
    
    handleFormSubmit(e, formId) {
        e.preventDefault();
        
        if (!this.userWallet) {
            this.showError('Please connect your wallet first');
            return;
        }
        
        const formData = this.getFormData(formId);
        const requiredAmount = this.getRequiredAmount(formId, formData);
        
        if (this.aqcnxBalance < requiredAmount) {
            this.showError(`Insufficient AQCNX balance. Required: ${requiredAmount}, Available: ${this.aqcnxBalance}`);
            return;
        }
        
        this.showConfirmationModal(formId, formData, requiredAmount);
    }
    
    getFormData(formId) {
        const formData = {};
        const form = document.getElementById(formId);
        const inputs = form.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            formData[input.id] = input.value;
        });
        
        return formData;
    }
    
    getRequiredAmount(formId, formData) {
        switch (formId) {
            case 'airtime-form':
                return parseInt(formData['airtime-amount']) || 0;
            case 'data-form':
                const planValue = formData['data-plan'];
                if (planValue) {
                    const amount = planValue.split('-')[1];
                    return parseInt(amount) || 0;
                }
                return 0;
            case 'electricity-form':
                return parseInt(formData['electricity-amount']) || 0;
            case 'tv-form':
                const packageValue = formData['tv-package'];
                if (packageValue) {
                    const amount = packageValue.split('-')[1];
                    return parseInt(amount) || 0;
                }
                return 0;
            default:
                return 0;
        }
    }
    
    showConfirmationModal(formId, formData, amount) {
        const modal = document.getElementById('confirmation-modal');
        const serviceSpan = document.getElementById('confirm-service');
        const amountSpan = document.getElementById('confirm-amount');
        const totalSpan = document.getElementById('total-amount');
        
        if (modal && serviceSpan && amountSpan && totalSpan) {
            serviceSpan.textContent = this.getServiceName(formId);
            amountSpan.textContent = `${amount} AQCNX`;
            totalSpan.textContent = `${amount} AQCNX`;
            
            modal.classList.add('show');
            
            // Setup confirm button
            const confirmBtn = document.getElementById('confirm-transaction');
            if (confirmBtn) {
                confirmBtn.onclick = () => this.processTransaction(formId, formData, amount);
            }
        }
    }
    
    getServiceName(formId) {
        const serviceNames = {
            'airtime-form': 'Airtime Recharge',
            'data-form': 'Data Bundle',
            'electricity-form': 'Electricity Bill',
            'tv-form': 'TV Subscription'
        };
        return serviceNames[formId] || 'Service';
    }
    
    async processTransaction(formId, formData, amount) {
        this.closeModal('confirmation-modal');
        this.showStatusModal('Processing transaction...', '⏳');
        
        try {
            // Simulate transaction processing
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Deduct balance
            this.aqcnxBalance -= amount;
            
            // Add to transaction history
            this.addTransaction({
                id: Date.now(),
                service: this.getServiceName(formId),
                amount: amount,
                status: 'success',
                timestamp: new Date(),
                details: formData
            });
            
            this.updateDisplay();
            this.updateTransactionHistory();
            this.showStatusModal('Transaction successful!', '✅');
            
            setTimeout(() => {
                this.closeModal('status-modal');
            }, 2000);
            
        } catch (error) {
            console.error('Transaction failed:', error);
            this.showStatusModal('Transaction failed. Please try again.', '❌');
        }
    }
    
    addTransaction(transaction) {
        this.transactionHistory.unshift(transaction);
        if (this.transactionHistory.length > 10) {
            this.transactionHistory.pop();
        }
    }
    
    updateTransactionHistory() {
        const historyContainer = document.getElementById('transaction-history');
        if (!historyContainer) return;
        
        if (this.transactionHistory.length === 0) {
            historyContainer.innerHTML = '<div class="empty-state"><span>No transactions yet</span></div>';
            return;
        }
        
        const historyHTML = this.transactionHistory.map(tx => `
            <div class="transaction-item">
                <div class="transaction-details">
                    <div class="transaction-type">${tx.service}</div>
                    <div>Amount: ${tx.amount} AQCNX</div>
                    <div>${tx.timestamp.toLocaleDateString()}</div>
                </div>
                <div class="transaction-status status-${tx.status}">${tx.status}</div>
            </div>
        `).join('');
        
        historyContainer.innerHTML = historyHTML;
    }
    
    showStatusModal(message, icon) {
        const modal = document.getElementById('status-modal');
        const messageSpan = document.getElementById('status-message');
        const iconSpan = document.getElementById('status-icon');
        
        if (modal && messageSpan && iconSpan) {
            messageSpan.textContent = message;
            iconSpan.textContent = icon;
            modal.classList.add('show');
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showInfo(message) {
        this.showNotification(message, 'info');
    }
    
    showNotification(message, type) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        switch (type) {
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                break;
            case 'success':
                notification.style.backgroundColor = '#10b981';
                break;
            case 'info':
                notification.style.backgroundColor = '#3b82f6';
                break;
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vtuDashboard = new VTUDashboard();
    
    // Setup modal close buttons
    const closeButtons = document.querySelectorAll('.close-btn, #cancel-transaction, #close-status-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });
    
    // Close modals when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
});
