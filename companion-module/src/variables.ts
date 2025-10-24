import type { ModuleInstance } from './main.js'

export enum ModuleVariable {
	PressedKey = 'pressed_key',
	LastPressedOn = 'last_pressed_on',
	L2Pos = 'l2_pos',
	R2Pos = 'r2_pos',
	TouchpadXPos = 'touchpad_x_pos',
	TouchpadYPos = 'touchpad_y_pos',
	TouchpadDirection = 'touchpad_direction',
	L3Pos = 'l3_pos',
	L3Direction = 'l3_direction',
	R3Pos = 'r3_pos',
	R3Direction = 'r3_direction',
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
		{
			variableId: ModuleVariable.L2Pos,
			name: 'Position of L2 trigger',
		},
		{
			variableId: ModuleVariable.R2Pos,
			name: 'Position of R2 trigger',
		},
		{
			variableId: ModuleVariable.TouchpadXPos,
			name: 'X position of touchpad event',
		},
		{
			variableId: ModuleVariable.TouchpadYPos,
			name: 'Y position of touchpad event',
		},
		{
			variableId: ModuleVariable.TouchpadDirection,
			name: 'Direction of touchpad event',
		},
		{
			variableId: ModuleVariable.L3Pos,
			name: 'Position of L3 joystick',
		},
		{
			variableId: ModuleVariable.L3Direction,
			name: 'Direction of L3 joystick',
		},
		{
			variableId: ModuleVariable.R3Pos,
			name: 'Position of R3 joystick',
		},
		{
			variableId: ModuleVariable.R3Direction,
			name: 'Direction of R3 joystick',
		},
	])
}
