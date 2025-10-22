import { DualsenseButtons } from './dualsense.js'
import { logger } from './logger.js'
import type { ModuleInstance } from './main.js'
import { ModuleVariable } from './variables.js'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		sample_action: {
			name: 'Log something',
			options: [
				{
					id: 'button',
					label: 'Trigger button',
					type: 'dropdown',
					choices: DualsenseButtons.map((button) => ({
						id: button,
						label: button,
					})),
					default: 'cross',
				},
			],
			callback: async (event) => {
				if (event.options.button === self.getVariableValue(ModuleVariable.PressedKey))
					logger.info(`Something was triggered by ${event.options.button}`)
			},
		},
	})
}
