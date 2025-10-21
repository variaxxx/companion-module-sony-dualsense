import { WebSocketServer } from 'ws'
import { ModuleInstance } from './main.js'
import { ModuleVariable } from './variables.js'

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

export function SetupDualsenseWs(self: ModuleInstance): void {
	const server = new WebSocketServer({
		port: self.config.wsPort,
	})

	server.on('connection', (ws) => {
		ws.on('message', (data: any) => {
			const key: (typeof DualsenseButtons)[number] = data.toString()
			console.log(`Received: ${key}`)

			self.setVariableValues({
				[ModuleVariable.PressedKey]: key,
				[ModuleVariable.LastPressedOn]: Date.now(),
			})
		})

		ws.on('close', () => {
			console.log('WebSocket connection closed')
		})

		console.log('WebSocket connected')
	})
}
