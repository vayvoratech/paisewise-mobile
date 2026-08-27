import mixpanel from './mixpanel';

const getSessionId = () => 'sess_abc123'; // Replace with your active session ID getter/store

export const Analytics = {
  
  // 1. WEEK 1: AUTHENTICATION, ONBOARDING & LEARNING EVENTS
  appOpened: (data: {
    sessionId: string;
    appVersion: string;
    deviceType: string;
    osVersion: string;
    deviceModel: string;
    isFirstOpen: boolean;
    previousSessionDurationSeconds: number;
  }) => {
    mixpanel.track('app_opened', {
      session_id: data.sessionId,
      app_version: data.appVersion,
      device_type: data.deviceType,
      os_version: data.osVersion,
      device_model: data.deviceModel,
      is_first_open: data.isFirstOpen,
      previous_session_duration_seconds: data.previousSessionDurationSeconds,
    });
  },

  onboardingStarted: (data: {
    sessionId: string;
    appVersion: string;
    deviceType: string;
    isReturning: boolean;
  }) => {
    mixpanel.track('onboarding_started', {
      session_id: data.sessionId,
      app_version: data.appVersion,
      device_type: data.deviceType,
      is_returning: data.isReturning,
    });
  },

  onboardingStepCompleted: (data: {
    sessionId: string;
    stepNumber: number;
    stepName: string;
    timeSpentSeconds: number;
    swipeOrTap: string;
  }) => {
    mixpanel.track('onboarding_step_completed', {
      session_id: data.sessionId,
      step_number: data.stepNumber,
      step_name: data.stepName,
      time_spent_seconds: data.timeSpentSeconds,
      swipe_or_tap: data.swipeOrTap,
    });
  },

  goalSelected: (data: {
    sessionId: string;
    goalType: string;
    goalDisplayText: string;
    selectedAtStep: number;
  }) => {
    mixpanel.track('goal_selected', {
      session_id: data.sessionId,
      goal_type: data.goalType,
      goal_display_text: data.goalDisplayText,
      selected_at_step: data.selectedAtStep,
    });
  },

  languageSelected: (data: {
    sessionId: string;
    languageSelected: string;
    languagePrevious: string;
    source: string;
  }) => {
    mixpanel.track('language_selected', {
      session_id: data.sessionId,
      language_selected: data.languageSelected,
      language_previous: data.languagePrevious,
      source: data.source,
    });
  },

  signupStarted: (data: {
    sessionId: string;
    appVersion: string;
    deviceType: string;
  }) => {
    mixpanel.track('signup_started', {
      session_id: data.sessionId,
      app_version: data.appVersion,
      device_type: data.deviceType,
    });
  },

  registrationSubmitted: (data: {
    sessionId: string;
    phoneLast4: string;
    passwordStrength: string;
  }) => {
    mixpanel.track('registration_submitted', {
      session_id: data.sessionId,
      phone_last4: data.phoneLast4,
      password_strength: data.passwordStrength,
    });
  },

  registrationSuccess: (data: {
    sessionId: string;
    phoneLast4: string;
    isNewUser: boolean;
  }) => {
    mixpanel.track('registration_success', {
      session_id: data.sessionId,
      phone_last4: data.phoneLast4,
      is_new_user: data.isNewUser,
    });
  },

  registrationFailed: (data: {
    sessionId: string;
    phoneLast4: string;
    failureReason: string;
  }) => {
    mixpanel.track('registration_failed', {
      session_id: data.sessionId,
      phone_last4: data.phoneLast4,
      failure_reason: data.failureReason,
    });
  },

  loginSuccess: (data: {
    sessionId: string;
    loginMethod: string;
    timeToLoginSeconds: number;
    daysSinceLastLogin: number;
  }) => {
    mixpanel.track('login_success', {
      session_id: data.sessionId,
      login_method: data.loginMethod,
      time_to_login_seconds: data.timeToLoginSeconds,
      days_since_last_login: data.daysSinceLastLogin,
    });
  },

  loginFailed: (data: {
    sessionId: string;
    loginMethod: string;
    attemptNumber: number;
    attemptsRemaining: number;
    failureReason: string;
  }) => {
    mixpanel.track('login_failed', {
      session_id: data.sessionId,
      login_method: data.loginMethod,
      attempt_number: data.attemptNumber,
      attempts_remaining: data.attemptsRemaining,
      failure_reason: data.failureReason,
    });
  },

  forgotPasswordTapped: (data: { sessionId: string }) => {
    mixpanel.track('forgot_password_tapped', {
      session_id: data.sessionId,
    });
  },

  otpRequested: (data: {
    sessionId: string;
    isResend: boolean;
    resendCount: number;
    purpose: string;
  }) => {
    mixpanel.track('otp_requested', {
      session_id: data.sessionId,
      is_resend: data.isResend,
      resend_count: data.resendCount,
      purpose: data.purpose,
    });
  },

  otpVerified: (data: {
    sessionId: string;
    attemptNumber: number;
    timeToVerifySeconds: number;
    purpose: string;
  }) => {
    mixpanel.track('otp_verified', {
      session_id: data.sessionId,
      attempt_number: data.attemptNumber,
      time_to_verify_seconds: data.timeToVerifySeconds,
      purpose: data.purpose,
    });
  },

  otpFailed: (data: {
    sessionId: string;
    attemptNumber: number;
    attemptsRemaining: number;
    failureReason: string;
  }) => {
    mixpanel.track('otp_failed', {
      session_id: data.sessionId,
      attempt_number: data.attemptNumber,
      attempts_remaining: data.attemptsRemaining,
      failure_reason: data.failureReason,
    });
  },

  passwordResetCompleted: (data: {
    sessionId: string;
    timeToCompleteSeconds: number;
  }) => {
    mixpanel.track('password_reset_completed', {
      session_id: data.sessionId,
      time_to_complete_seconds: data.timeToCompleteSeconds,
    });
  },

  logout: (data: {
    sessionId: string;
    sessionDurationSeconds: number;
    logoutReason: string;
  }) => {
    mixpanel.track('logout', {
      session_id: data.sessionId,
      session_duration_seconds: data.sessionDurationSeconds,
      logout_reason: data.logoutReason,
    });
    mixpanel.reset();
  },

  lessonListViewed: (data: {
    sessionId: string;
    chapterId: string;
    chapterName: string;
    lessonsTotal: number;
    lessonsCompleted: number;
    language: string;
  }) => {
    mixpanel.track('lesson_list_viewed', {
      session_id: data.sessionId,
      chapter_id: data.chapterId,
      chapter_name: data.chapterName,
      lessons_total: data.lessonsTotal,
      lessons_completed: data.lessonsCompleted,
      language: data.language,
    });
  },

  lessonTapped: (data: {
    sessionId: string;
    lessonId: string;
    lessonTitle: string;
    lessonOrder: number;
    lessonStatus: string;
    sourcePosition: number;
  }) => {
    mixpanel.track('lesson_tapped', {
      session_id: data.sessionId,
      lesson_id: data.lessonId,
      lesson_title: data.lessonTitle,
      lesson_order: data.lessonOrder,
      lesson_status: data.lessonStatus,
      source_position: data.sourcePosition,
    });
  },

  lessonStarted: (data: {
    sessionId: string;
    lessonId: string;
    lessonTitle: string;
    chapterId: string;
    chapterName: string;
    lessonOrder: number;
    language: string;
    totalBlocks: number;
    isResume: boolean;
    resumeBlockIndex: number;
    estimatedMinutes: number;
  }) => {
    mixpanel.track('lesson_started', {
      session_id: data.sessionId,
      lesson_id: data.lessonId,
      lesson_title: data.lessonTitle,
      chapter_id: data.chapterId,
      chapter_name: data.chapterName,
      lesson_order: data.lessonOrder,
      language: data.language,
      total_blocks: data.totalBlocks,
      is_resume: data.isResume,
      resume_block_index: data.resumeBlockIndex,
      estimated_minutes: data.estimatedMinutes,
    });
  },

  lessonContentScrolled: (data: {
    sessionId: string;
    lessonId: string;
    scrollDepthPct: number;
    currentBlockIndex: number;
    timeElapsedSeconds: number;
  }) => {
    mixpanel.track('lesson_content_scrolled', {
      session_id: data.sessionId,
      lesson_id: data.lessonId,
      scroll_depth_pct: data.scrollDepthPct,
      current_block_index: data.currentBlockIndex,
      time_elapsed_seconds: data.timeElapsedSeconds,
    });
  },

  jargonTermTapped: (data: {
    sessionId: string;
    lessonId: string;
    term: string;
    termDisplay: string;
    language: string;
    blockIndex: number;
    tapCountInLesson: number;
  }) => {
    mixpanel.track('jargon_term_tapped', {
      session_id: data.sessionId,
      lesson_id: data.lessonId,
      term: data.term,
      term_display: data.termDisplay,
      language: data.language,
      block_index: data.blockIndex,
      tap_count_in_lesson: data.tapCountInLesson,
    });
  },

  jargonSheetClosed: (data: {
    sessionId: string;
    lessonId: string;
    term: string;
    timeOpenSeconds: number;
    closeMethod: string;
  }) => {
    mixpanel.track('jargon_sheet_closed', {
      session_id: data.sessionId,
      lesson_id: data.lessonId,
      term: data.term,
      time_open_seconds: data.timeOpenSeconds,
      close_method: data.closeMethod,
    });
  },

  lessonCompleted: (data: {
    sessionId: string;
    lessonId: string;
    chapterId: string;
    language: string;
    timeSpentSeconds: number;
    totalBlocksViewed: number;
    xpEarned: number;
    isFirstCompletion: boolean;
  }) => {
    mixpanel.track('lesson_completed', {
      session_id: data.sessionId,
      lesson_id: data.lessonId,
      chapter_id: data.chapterId,
      language: data.language,
      time_spent_seconds: data.timeSpentSeconds,
      total_blocks_viewed: data.totalBlocksViewed,
      xp_earned: data.xpEarned,
      is_first_completion: data.isFirstCompletion,
    });
  },

  quizStarted: (data: {
    sessionId: string;
    lessonId: string;
    attemptNumber: number;
    totalQuestions: number;
    language: string;
  }) => {
    mixpanel.track('quiz_started', {
      session_id: data.sessionId,
      lesson_id: data.lessonId,
      attempt_number: data.attemptNumber,
      total_questions: data.totalQuestions,
      language: data.language,
    });
  },

  quizQuestionAnswered: (data: {
    sessionId: string;
    lessonId: string;
    questionId: string;
    questionIndex: number;
    selectedOption: string;
    isCorrect: boolean;
    timeSpentSeconds: number;
  }) => {
    mixpanel.track('quiz_question_answered', {
      session_id: data.sessionId,
      lesson_id: data.lessonId,
      question_id: data.questionId,
      question_index: data.questionIndex,
      selected_option: data.selectedOption,
      is_correct: data.isCorrect,
      time_spent_seconds: data.timeSpentSeconds,
    });
  },

  quizCompleted: (data: {
    sessionId: string;
    lessonId: string;
    attemptNumber: number;
    totalQuestions: number;
    correctAnswers: number;
    scorePct: number;
    passed: boolean;
    xpEarned: number;
    xpBonus: number;
    timeSpentSeconds: number;
    language: string;
    questionsServed: any[];
  }) => {
    mixpanel.track('quiz_completed', {
      session_id: data.sessionId,
      lesson_id: data.lessonId,
      attempt_number: data.attemptNumber,
      total_questions: data.totalQuestions,
      correct_answers: data.correctAnswers,
      score_pct: data.scorePct,
      passed: data.passed,
      xp_earned: data.xpEarned,
      xp_bonus: data.xpBonus,
      time_spent_seconds: data.timeSpentSeconds,
      language: data.language,
      questions_served: data.questionsServed,
    });
  },

  quizRetried: (data: {
    sessionId: string;
    lessonId: string;
    previousAttemptNumber: number;
    previousScorePct: number;
    newAttemptNumber: number;
  }) => {
    mixpanel.track('quiz_retried', {
      session_id: data.sessionId,
      lesson_id: data.lessonId,
      previous_attempt_number: data.previousAttemptNumber,
      previous_score_pct: data.previousScorePct,
      new_attempt_number: data.newAttemptNumber,
    });
  },

  badgeEarned: (data: {
    sessionId: string;
    badgeId: string;
    badgeName: string;
    badgeCategory: string;
    triggerEvent: string;
  }) => {
    mixpanel.track('badge_earned', {
      session_id: data.sessionId,
      badge_id: data.badgeId,
      badge_name: data.badgeName,
      badge_category: data.badgeCategory,
      trigger_event: data.triggerEvent,
    });
  },

  levelUp: (data: {
    sessionId: string;
    oldLevel: number;
    newLevel: number;
    totalXp: number;
    xpToNextLevel: number;
  }) => {
    mixpanel.track('level_up', {
      session_id: data.sessionId,
      old_level: data.oldLevel,
      new_level: data.newLevel,
      total_xp: data.totalXp,
      xp_to_next_level: data.xpToNextLevel,
    });
  },

  streakExtended: (data: {
    sessionId: string;
    newStreakDays: number;
    oldStreakDays: number;
    milestoneReached: boolean;
    milestoneValue: number;
  }) => {
    mixpanel.track('streak_extended', {
      session_id: data.sessionId,
      new_streak_days: data.newStreakDays,
      old_streak_days: data.oldStreakDays,
      milestone_reached: data.milestoneReached,
      milestone_value: data.milestoneValue,
    });
  },

  streakBroken: (data: {
    sessionId: string;
    brokenStreakDays: number;
    daysSinceActive: number;
    previousBest: number;
  }) => {
    mixpanel.track('streak_broken', {
      session_id: data.sessionId,
      broken_streak_days: data.brokenStreakDays,
      days_since_active: data.daysSinceActive,
      previous_best: data.previousBest,
    });
  },

  // 2. PAPER TRADING EVENTS
  practiceScreenViewed: (data: {
    sessionId: string;
    availableBalance: number;
    holdingsCount: number;
    unrealizedPnl: number;
  }) => {
    mixpanel.track('practice_screen_viewed', {
      session_id: data.sessionId,
      available_balance: data.availableBalance,
      holdings_count: data.holdingsCount,
      unrealized_pnl: data.unrealizedPnl,
    });
  },

  stockSearched: (data: {
    sessionId: string;
    queryText: string;
    resultsCount: number;
  }) => {
    mixpanel.track('stock_searched', {
      session_id: data.sessionId,
      query_text: data.queryText,
      results_count: data.resultsCount,
    });
  },

  stockTapped: (data: {
    sessionId: string;
    symbol: string;
    companyName: string;
    source: string;
    ltp: number;
  }) => {
    mixpanel.track('stock_tapped', {
      session_id: data.sessionId,
      symbol: data.symbol,
      company_name: data.companyName,
      source: data.source,
      ltp: data.ltp,
    });
  },

  chartIntervalChanged: (data: {
    sessionId: string;
    symbol: string;
    intervalSelected: string;
    intervalPrevious: string;
  }) => {
    mixpanel.track('chart_interval_changed', {
      session_id: data.sessionId,
      symbol: data.symbol,
      interval_selected: data.intervalSelected,
      interval_previous: data.intervalPrevious,
    });
  },

  buyModalOpened: (data: {
    sessionId: string;
    symbol: string;
    companyName: string;
    currentLtp: number;
    source: string;
    isPaper: boolean;
    availableBalance: number;
  }) => {
    mixpanel.track('buy_modal_opened', {
      session_id: data.sessionId,
      symbol: data.symbol,
      company_name: data.companyName,
      current_ltp: data.currentLtp,
      source: data.source,
      is_paper: data.isPaper,
      available_balance: data.availableBalance,
    });
  },

  sellModalOpened: (data: {
    sessionId: string;
    symbol: string;
    companyName: string;
    currentLtp: number;
    source: string;
    isPaper: boolean;
    quantityOwned: number;
  }) => {
    mixpanel.track('sell_modal_opened', {
      session_id: data.sessionId,
      symbol: data.symbol,
      company_name: data.companyName,
      current_ltp: data.currentLtp,
      source: data.source,
      is_paper: data.isPaper,
      quantity_owned: data.quantityOwned,
    });
  },

  orderTypeSelected: (data: {
    sessionId: string;
    symbol: string;
    orderType: string;
    orderTypePrevious: string;
  }) => {
    mixpanel.track('order_type_selected', {
      session_id: data.sessionId,
      symbol: data.symbol,
      order_type: data.orderType,
      order_type_previous: data.orderTypePrevious,
    });
  },

  quantityChanged: (data: {
    sessionId: string;
    symbol: string;
    quantity: number;
    quantityPrevious: number;
    inputMethod: string;
  }) => {
    mixpanel.track('quantity_changed', {
      session_id: data.sessionId,
      symbol: data.symbol,
      quantity: data.quantity,
      quantity_previous: data.quantityPrevious,
      input_method: data.inputMethod,
    });
  },

  paperOrderConfirmed: (data: {
    sessionId: string;
    symbol: string;
    side: string;
    orderType: string;
    quantity: number;
    price: number;
    totalValue: number;
    isPaper: boolean;
    clientOrderId: string;
    balanceAfterEstimate: number;
  }) => {
    mixpanel.track('paper_order_confirmed', {
      session_id: data.sessionId,
      symbol: data.symbol,
      side: data.side,
      order_type: data.orderType,
      quantity: data.quantity,
      price: data.price,
      total_value: data.totalValue,
      is_paper: data.isPaper,
      client_order_id: data.clientOrderId,
      balance_after_estimate: data.balanceAfterEstimate,
    });
  },

  paperOrderPlaced: (data: {
    sessionId: string;
    orderId: string;
    clientOrderId: string;
    symbol: string;
    side: string;
    quantity: number;
    fillPrice: number;
    totalValue: number;
    isPaper: boolean;
    timeToConfirmMs: number;
  }) => {
    mixpanel.track('paper_order_placed', {
      session_id: data.sessionId,
      order_id: data.orderId,
      client_order_id: data.clientOrderId,
      symbol: data.symbol,
      side: data.side,
      quantity: data.quantity,
      fill_price: data.fillPrice,
      total_value: data.totalValue,
      is_paper: data.isPaper,
      time_to_confirm_ms: data.timeToConfirmMs,
    });
  },

  paperOrderFailed: (data: {
    sessionId: string;
    clientOrderId: string;
    symbol: string;
    side: string;
    quantity: number;
    totalValue: number;
    isPaper: boolean;
    errorCode: string;
    errorMessage: string;
    httpStatus: number;
  }) => {
    mixpanel.track('paper_order_failed', {
      session_id: data.sessionId,
      client_order_id: data.clientOrderId,
      symbol: data.symbol,
      side: data.side,
      quantity: data.quantity,
      total_value: data.totalValue,
      is_paper: data.isPaper,
      error_code: data.errorCode,
      error_message: data.errorMessage,
      http_status: data.httpStatus,
    });
  },

  paperPortfolioViewed: (data: {
    sessionId: string;
    holdingsCount: number;
    totalInvested: number;
    currentValue: number;
    totalPnl: number;
    totalPnlPct: number;
  }) => {
    mixpanel.track('paper_portfolio_viewed', {
      session_id: data.sessionId,
      holdings_count: data.holdingsCount,
      total_invested: data.totalInvested,
      current_value: data.currentValue,
      total_pnl: data.totalPnl,
      total_pnl_pct: data.totalPnlPct,
    });
  },

  paperResetRequested: (data: {
    sessionId: string;
    previousBalance: number;
    previousPnl: number;
  }) => {
    mixpanel.track('paper_reset_requested', {
      session_id: data.sessionId,
      previous_balance: data.previousBalance,
      previous_pnl: data.previousPnl,
    });
  },

  paperResetConfirmed: (data: {
    sessionId: string;
    previousBalance: number;
    previousPnl: number;
    resetReason: string;
  }) => {
    mixpanel.track('paper_reset_confirmed', {
      session_id: data.sessionId,
      previous_balance: data.previousBalance,
      previous_pnl: data.previousPnl,
      reset_reason: data.resetReason,
    });
  },

  // ==========================================
  // 3. WEEK 2: KYC, REAL TRADING, MUTUAL FUNDS, SIP, & PORTFOLIO EVENTS (1-35)
  // ==========================================

  kycStarted(params: { kyc_status_before: string; entry_source: string }) {
    mixpanel.track('kyc_started', { session_id: getSessionId(), ...params });
  },
  kycStepCompleted(params: { step_number: number; step_name: string; time_spent_seconds: number }) {
    mixpanel.track('kyc_step_completed', { session_id: getSessionId(), ...params });
  },
  kycPanSubmitted(params: { pan_format_valid: boolean; verification_method: string }) {
    mixpanel.track('kyc_pan_submitted', { session_id: getSessionId(), ...params });
  },
  kycDigilockerOpened(params: { step_number: number }) {
    mixpanel.track('kyc_digilocker_opened', { session_id: getSessionId(), ...params });
  },
  kycDigilockerCompleted(params: { time_to_complete_seconds: number; digilocker_status: string }) {
    mixpanel.track('kyc_digilocker_completed', { session_id: getSessionId(), ...params });
  },
  kycVideoStarted(params: { attempt_number: number }) {
    mixpanel.track('kyc_video_started', { session_id: getSessionId(), ...params });
  },
  kycVideoCompleted(params: { recording_duration_seconds: number; attempt_number: number }) {
    mixpanel.track('kyc_video_completed', { session_id: getSessionId(), ...params });
  },
  kycCompleted(params: { total_time_to_complete_seconds: number; steps_completed_count: number }) {
    mixpanel.track('kyc_completed', { session_id: getSessionId(), ...params });
  },
  kycFailed(params: { failed_step: string; failure_reason: string }) {
    mixpanel.track('kyc_failed', { session_id: getSessionId(), ...params });
  },
  kycAbandoned(params: { last_step_reached: string; time_spent_seconds: number }) {
    mixpanel.track('kyc_abandoned', { session_id: getSessionId(), ...params });
  },

  realBuyModalOpened(params: { symbol: string; company_name: string; current_ltp: number; source: string; is_paper: boolean; available_balance: number }) {
    mixpanel.track('real_buy_modal_opened', { session_id: getSessionId(), ...params });
  },
  realOrderConfirmed(params: { symbol: string; side: string; order_type: string; quantity: number; price: number; total_value: number; is_paper: boolean; client_order_id: string }) {
    mixpanel.track('real_order_confirmed', { session_id: getSessionId(), ...params });
  },
  realOrderPlaced(params: { order_id: string; client_order_id: string; symbol: string; side: string; quantity: number; fill_price: number; total_value: number; is_paper: boolean; time_to_confirm_ms: number }) {
    mixpanel.track('real_order_placed', { session_id: getSessionId(), ...params });
  },
  realOrderFailed(params: { client_order_id: string; symbol: string; side: string; quantity: number; total_value: number; error_code: string; error_message: string; http_status: number }) {
    mixpanel.track('real_order_failed', { session_id: getSessionId(), ...params });
  },
  orderCancelled(params: { order_id: string; symbol: string; side: string; order_type: string; time_since_placed_seconds: number; cancel_reason: string }) {
    mixpanel.track('order_cancelled', { session_id: getSessionId(), ...params });
  },
  orderFilledNotificationReceived(params: { order_id: string; symbol: string; fill_price: number; time_to_fill_seconds: number }) {
    mixpanel.track('order_filled_notification_received', { session_id: getSessionId(), ...params });
  },

  mfScreenViewed(params: { funds_shown_count: number; default_filter: string }) {
    mixpanel.track('mf_screen_viewed', { session_id: getSessionId(), ...params });
  },
  mfCategoryFiltered(params: { category_selected: string; category_previous: string; results_count: number }) {
    mixpanel.track('mf_category_filtered', { session_id: getSessionId(), ...params });
  },
  mfSearched(params: { query_text: string; results_count: number }) {
    mixpanel.track('mf_searched', { session_id: getSessionId(), ...params });
  },
  fundTapped(params: { fund_id: string; fund_name: string; fund_category: string; source_position: number }) {
    mixpanel.track('fund_tapped', { session_id: getSessionId(), ...params });
  },
  fundDetailViewed(params: { fund_id: string; fund_name: string; fund_category: string; returns_1y_pct: number; expense_ratio_pct: number; risk_level: string }) {
    mixpanel.track('fund_detail_viewed', { session_id: getSessionId(), ...params });
  },
  riskOmeterViewed(params: { fund_id: string; risk_level: string }) {
    mixpanel.track('risk_ometer_viewed', { session_id: getSessionId(), ...params });
  },
  sipSetupStarted(params: { fund_id: string; fund_name: string; entry_source: string }) {
    mixpanel.track('sip_setup_started', { session_id: getSessionId(), ...params });
  },
  sipAmountEntered(params: { fund_id: string; amount: number; amount_previous: number; input_method: string }) {
    mixpanel.track('sip_amount_entered', { session_id: getSessionId(), ...params });
  },
  sipDateSelected(params: { fund_id: string; debit_date: number; debit_date_previous: number }) {
    mixpanel.track('sip_date_selected', { session_id: getSessionId(), ...params });
  },
  sipConfirmed(params: { fund_id: string; amount: number; debit_date: number; client_sip_id: string }) {
    mixpanel.track('sip_confirmed', { session_id: getSessionId(), ...params });
  },
  sipCreated(params: { sip_id: string; client_sip_id: string; fund_id: string; amount: number; debit_date: number; first_debit_date: string }) {
    mixpanel.track('sip_created', { session_id: getSessionId(), ...params });
  },
  sipPaused(params: { sip_id: string; fund_id: string; pause_duration_months: number; pause_reason: string }) {
    mixpanel.track('sip_paused', { session_id: getSessionId(), ...params });
  },
  sipCancelled(params: { sip_id: string; fund_id: string; total_installments_completed: number; total_invested_before_cancel: number; cancel_reason: string }) {
    mixpanel.track('sip_cancelled', { session_id: getSessionId(), ...params });
  },
  lumpsumInvested(params: { fund_id: string; fund_name: string; amount: number; payment_method: string }) {
    mixpanel.track('lumpsum_invested', { session_id: getSessionId(), ...params });
  },

  portfolioViewed(params: { holdings_count: number; total_invested: number; current_value: number; total_pnl: number; total_pnl_pct: number; has_mf_holdings: boolean; has_stock_holdings: boolean }) {
    mixpanel.track('portfolio_viewed', { session_id: getSessionId(), ...params });
  },
  holdingTapped(params: { holding_id: string; holding_type: string; symbol_or_fund_id: string; source_position: number }) {
    mixpanel.track('holding_tapped', { session_id: getSessionId(), ...params });
  },
  aiInsightViewed(params: { insight_scope: string; holding_id: string | null; insight_category: string }) {
    mixpanel.track('ai_insight_viewed', { session_id: getSessionId(), ...params });
  },
  pnlReportViewed(params: { report_period: string; total_realized_pnl: number; total_unrealized_pnl: number }) {
    mixpanel.track('pnl_report_viewed', { session_id: getSessionId(), ...params });
  },
  taxReportDownloaded(params: { report_type: string; report_period: string; file_format: string }) {
    mixpanel.track('tax_report_downloaded', { session_id: getSessionId(), ...params });
  },
};