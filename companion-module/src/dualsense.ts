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

export interface Message {
	code: number
	type: 'error' | 'buttonPress' | 'message'
	message: string
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
				}),
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
			const obj: Message = JSON.parse(data.toString())

			if (obj.type === 'buttonPress') {
				logger.info(`Received event: ${obj.message}`)

				self.setVariableValues({
					[ModuleVariable.PressedKey]: obj.message,
					[ModuleVariable.LastPressedOn]: Date.now(),
				})
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
