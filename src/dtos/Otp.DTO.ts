export interface IOtpDTO {
	id: string
	otpHash: string
	userId: string
	createdAt: string
}

export interface IOtpParamsDTO {
	token: string
	userId: string
}
