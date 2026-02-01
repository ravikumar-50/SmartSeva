/**
 * LineLess Queue Manager
 * Handles queue simulation, token generation, and real-time updates
 */

class QueueManager {
  constructor() {
    this.currentQueue = [];
    this.currentToken = null;
    this.currentServing = 'A-36';
    this.tokenPrefix = 'A';
    this.lastTokenNumber = 42;
    this.departments = [
      'General OP',
      'X-Ray',
      'Billing',
      'Laboratory',
      'Pharmacy',
      'Emergency'
    ];
  }

  /**
   * Generate a new token for a user
   */
  generateToken(userName, mobile, department) {
    this.lastTokenNumber++;
    const tokenNumber = `${this.tokenPrefix}-${this.lastTokenNumber}`;

    this.currentToken = {
      number: tokenNumber,
      userName: userName,
      mobile: mobile,
      department: department,
      timestamp: new Date(),
      status: 'waiting'
    };

    return this.currentToken;
  }

  /**
   * Get current token information
   */
  getCurrentToken() {
    return this.currentToken;
  }

  /**
   * Calculate how many people are ahead in queue
   */
  getPeopleAhead() {
    if (!this.currentToken) return 0;

    const servingNumber = parseInt(this.currentServing.split('-')[1]);
    const userTokenNumber = parseInt(this.currentToken.number.split('-')[1]);

    return Math.max(0, userTokenNumber - servingNumber - 1);
  }

  /**
   * Get estimated wait time in minutes
   */
  getEstimatedWaitTime() {
    const peopleAhead = this.getPeopleAhead();
    const avgTimePerPerson = 3; // 3 minutes average
    return peopleAhead * avgTimePerPerson;
  }

  /**
   * Get current serving token
   */
  getCurrentServing() {
    return this.currentServing;
  }

  /**
   * Simulate queue progression
   */
  advanceQueue() {
    const servingNumber = parseInt(this.currentServing.split('-')[1]);
    this.currentServing = `${this.tokenPrefix}-${servingNumber + 1}`;
    return this.currentServing;
  }

  /**
   * Get queue status for the user
   * Returns: 'relax', 'soon', 'now', or 'missed'
   */
  getQueueStatus() {
    if (!this.currentToken) return 'relax';

    const peopleAhead = this.getPeopleAhead();

    if (peopleAhead < 0) {
      return 'missed'; // User missed their turn
    } else if (peopleAhead === 0) {
      return 'now'; // User's turn is now
    } else if (peopleAhead <= 2) {
      return 'soon'; // Almost their turn
    } else {
      return 'relax'; // Still waiting
    }
  }

  /**
   * Get status message based on queue position
   */
  getStatusMessage() {
    const status = this.getQueueStatus();

    const messages = {
      'relax': 'Relax, you still have time. We\'ll notify you when your turn is near.',
      'soon': 'Almost your turn! Please come near the counter.',
      'now': 'Your token is being served. Please proceed to the counter.',
      'missed': 'Your token was missed. Please contact the help desk.'
    };

    return {
      text: messages[status],
      type: status
    };
  }

  /**
   * Get progress percentage for progress bar
   */
  getProgressPercentage() {
    if (!this.currentToken) return 0;

    const servingNumber = parseInt(this.currentServing.split('-')[1]);
    const userTokenNumber = parseInt(this.currentToken.number.split('-')[1]);

    // If user's token is being served or already passed
    if (servingNumber >= userTokenNumber) return 100;

    // Calculate initial starting point when token was generated
    const initialTokenNumber = userTokenNumber;
    const initialServingNumber = 36; // Default starting number

    // Total tokens ahead when generated
    const totalTokensAhead = initialTokenNumber - initialServingNumber;

    // Current tokens still ahead
    const tokensRemaining = userTokenNumber - servingNumber;

    // Progress = tokens processed / total tokens
    const tokensProcessed = totalTokensAhead - tokensRemaining;
    const progress = (tokensProcessed / totalTokensAhead) * 100;

    return Math.max(0, Math.min(100, progress));
  }

  /**
   * Generate mock queue list for public display
   */
  getQueueList() {
    const queue = [];
    const servingNumber = parseInt(this.currentServing.split('-')[1]);

    // Add current serving
    queue.push({
      token: this.currentServing,
      status: 'Now Serving',
      type: 'current'
    });

    // Add next 9 tokens
    for (let i = 1; i <= 9; i++) {
      const tokenNum = servingNumber + i;
      const status = i === 1 ? 'Next' : 'Waiting';
      queue.push({
        token: `${this.tokenPrefix}-${tokenNum}`,
        status: status,
        type: i === 1 ? 'next' : 'waiting'
      });
    }

    return queue;
  }

  /**
   * Start automatic queue progression
   */
  startAutoProgress(callback, interval = 5000) {
    return setInterval(() => {
      this.advanceQueue();
      if (callback) callback();
    }, interval);
  }

  /**
   * Get departments list
   */
  getDepartments() {
    return this.departments;
  }
}

// Create global instance
const queueManager = new QueueManager();
