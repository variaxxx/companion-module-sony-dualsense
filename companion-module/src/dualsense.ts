import { WebSocketServer } from 'ws'
import { ModuleInstance } from './main.js'
import { ModuleVariable } from './variables.js'
import { logger } from './logger.js'

export const DualsenseButtons = [
	'dpad_left',
	'dpad_up',
	'dpad_right',
	'dpad_down',
	'l1',
	'r1',
	'l2',
	'r2',
	'l3',
	'r3',
	'cross',
	'square',
	'triangle',
	'circle',
	'create',
	'options',
	'ps',
	'touchpad',
	'mute',
] as const

export interface OutgoingMessage {
	code: number
	type: 'error' | 'message'
	message: string
}

export interface IncomingMessage {
	code: number
	type: 'error' | 'message' | 'button'
	message?: string
	data?: {
		button: (typeof DualsenseButtons)[number]
		x?: number
		y?: number
		direction?: number
	}
}

export function SetupDualsenseWs(self: ModuleInstance): void {
	const server = new WebSocketServer({
		port: self.config.wsPort,
	})

	server.on('connection', (ws, req) => {
		const url = new URL(req.url!, `http://${req.headers.host}`)
		const secret = url.searchParams.get('token')

		if (!secret || secret !== self.config.wsSecret) {
			logger.warn('Someone is trying to connect with the wrong secret')
			ws.send(
				JSON.stringify({
					code: 401,
					type: 'error',
					message: 'Invalid token',
				} as OutgoingMessage),
			)
			ws.close()
		}

		ws.send(
			JSON.stringify({
				code: 200,
				type: 'message',
				message: 'Connection established',
			}),
		)

		ws.on('message', (data: any) => {
			const obj: IncomingMessage = JSON.parse(data.toString())

			if (obj.type === 'button') {
				logger.info(`Received event: ${obj.data?.button}`)

				self.setVariableValues({
					[ModuleVariable.PressedKey]: obj.data?.button,
					[ModuleVariable.LastPressedOn]: Date.now(),
				})

				switch (obj.data?.button) {
					case 'l2': {
						return self.setVariableValues({
							[ModuleVariable.L2Pos]: obj.data.x,
						})
					}
					case 'r2': {
						return self.setVariableValues({
							[ModuleVariable.R2Pos]: obj.data.x,
						})
					}
					case 'touchpad': {
						return self.setVariableValues({
							[ModuleVariable.TouchpadXPos]: obj.data.x,
							[ModuleVariable.TouchpadYPos]: obj.data.y,
							[ModuleVariable.TouchpadDirection]: obj.data.direction,
						})
					}
					case 'l3': {
						return self.setVariableValues({
							[ModuleVariable.L3Pos]: obj.data.x,
							[ModuleVariable.L3Direction]: obj.data.direction,
						})
					}
					case 'r3': {
						return self.setVariableValues({
							[ModuleVariable.R3Pos]: obj.data.x,
							[ModuleVariable.R3Direction]: obj.data.direction,
						})
					}
				}
			} else if (obj.type === 'message') {
				logger.info(`Received message: ${obj.message}`)
			} else if (obj.type === 'error') {
				logger.error(`Received error: ${obj.message}`)
			}
		})

		ws.on('error', (err) => logger.error(err))

		ws.on('close', () => {
			logger.info('WebSocket connection closed')
		})
	})
}
