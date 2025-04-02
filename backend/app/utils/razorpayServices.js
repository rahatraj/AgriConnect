import razorpayInstance from "../config/razorpay.js"

export const createRazorpayContact = async(user) => {
    const contact = await razorpayInstance.orders.create({
        name : user.fullName,
        email : user.email,
        type : user.role
    })

    return contact;
}

export const addFundAccount = async(contactId, bankDetails) => {
    const fundAmount = await razorpayInstance.fund_accounts.create({
        contact_id : contactId,
        account_type : "back_account",
        bank_account : {
            name : bankDetails.accountHolderName,
            ifsc : bankDetails.ifsc,
            account_number : bankDetails.accountNumber
        }  

    })
    return fundAmount;
}

export const createPayout = async(fundAccountId, amount, purpose) => {
    try {
        const payout = await razorpayInstance.payout.create({
            account_number : process.env.RAZORPAY_PAYOUT_ACCOUNT,
            fund_account_id : fundAccountId,
            amount : amount * 10,
            currency : "INR",
            mode : "IMPS",
            purpose : purpose,
            queue_if_low_balance : true,
            referenceId : `wallet_withdraw_${Date.now()}`,
            narration : `Wallet Withdraw`
        })
        return payout;
    } catch (error) {
        console.error("Error creating payout:", error.message);
        throw new CustomError("Payout creation failed. Please try again later.", 500);
    }
}