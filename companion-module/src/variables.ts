import type { ModuleInstance } from './main.js'

export enum ModuleVariable {
	PressedKey = 'pressed_key',
	LastPressedOn = 'last_pressed_on',
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions([
		{
			variableId: ModuleVariable.PressedKey,
			name: 'Name of last pressed key on gamepad',
		},
		{
			variableId: ModuleVariable.LastPressedOn,
			name: 'Time when last button was pressed',
		},
	])
}
