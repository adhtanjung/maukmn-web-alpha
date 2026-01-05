"use client";

import React, { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { POIFormData } from "@/app/contexts/POIFormContext";

const PAYMENT_OPTIONS = [
	{ value: "cash", label: "Cash", icon: "payments" },
	{ value: "credit_card", label: "Credit Card", icon: "credit_card" },
	{ value: "debit_card", label: "Debit Card", icon: "credit_card" },
	{ value: "qris", label: "QRIS", icon: "qr_code_scanner" },
	{ value: "gopay", label: "GoPay", icon: "account_balance_wallet" },
	{ value: "ovo", label: "OVO", icon: "account_balance_wallet" },
] as const;

const DAYS_OF_WEEK = [
	{ key: "monday", label: "Mon", fullLabel: "Monday" },
	{ key: "tuesday", label: "Tue", fullLabel: "Tuesday" },
	{ key: "wednesday", label: "Wed", fullLabel: "Wednesday" },
	{ key: "thursday", label: "Thu", fullLabel: "Thursday" },
	{ key: "friday", label: "Fri", fullLabel: "Friday" },
	{ key: "saturday", label: "Sat", fullLabel: "Saturday" },
	{ key: "sunday", label: "Sun", fullLabel: "Sunday" },
] as const;

interface DaySchedule {
	open: string;
	close: string;
}

export default function OperationsTab() {
	const { register, control, watch, setValue } = useFormContext<POIFormData>();

	const [selectedDay, setSelectedDay] = useState<string>("monday");
	const paymentOptions = watch("paymentOptions") || [];
	const openHours = watch("openHours") || {};

	const togglePayment = (payment: string) => {
		const current = paymentOptions || [];
		if (current.includes(payment)) {
			setValue(
				"paymentOptions",
				current.filter((p) => p !== payment)
			);
		} else {
			setValue("paymentOptions", [...current, payment]);
		}
	};

	const getDaySchedule = (day: string): DaySchedule | null => {
		return openHours[day] || null;
	};

	const updateDaySchedule = (day: string, schedule: DaySchedule | null) => {
		const updated = { ...openHours };
		if (schedule === null) {
			delete updated[day];
		} else {
			updated[day] = schedule;
		}
		setValue("openHours", updated);
	};

	const toggleDayOpen = (day: string) => {
		const current = getDaySchedule(day);
		if (current) {
			updateDaySchedule(day, null);
		} else {
			updateDaySchedule(day, { open: "09:00", close: "17:00" });
		}
	};

	const applyToAllDays = () => {
		const currentSchedule = getDaySchedule(selectedDay);
		if (!currentSchedule) return;

		const updated: Record<string, DaySchedule> = {};
		DAYS_OF_WEEK.forEach((day) => {
			updated[day.key] = { ...currentSchedule };
		});
		setValue("openHours", updated);
	};

	const isDayOpen = (day: string) => {
		return getDaySchedule(day) !== null;
	};

	return (
		<div className="px-4 py-4 space-y-8">
			{/* Operating Hours Section */}
			<section className="space-y-4">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Operating Hours
				</Label>
				<p className="text-muted-foreground text-sm">
					Set your business hours for each day of the week.
				</p>

				{/* Day Selector */}
				<div
					role="group"
					aria-label="Select day of week"
					className="flex gap-2 overflow-x-auto pb-2 pt-2 -mt-2 snap-x"
				>
					{DAYS_OF_WEEK.map((day) => (
						<Button
							key={day.key}
							type="button"
							variant={selectedDay === day.key ? "default" : "outline"}
							size="sm"
							onClick={() => setSelectedDay(day.key)}
							aria-pressed={selectedDay === day.key}
							aria-label={`${day.fullLabel}${
								isDayOpen(day.key) ? ", has hours set" : ", closed"
							}`}
							className="min-w-[60px] relative snap-start"
						>
							{day.label}
							{isDayOpen(day.key) && (
								<span
									className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"
									aria-hidden="true"
								/>
							)}
						</Button>
					))}
				</div>

				{/* Selected Day Schedule */}
				<div className="bg-surface-card border border-surface-border rounded-xl p-4 space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="text-foreground font-semibold">
							{DAYS_OF_WEEK.find((d) => d.key === selectedDay)?.fullLabel}
						</h4>
						<div className="flex items-center gap-2">
							<Label className="text-sm text-muted-foreground">Open</Label>
							<Switch
								checked={isDayOpen(selectedDay)}
								onCheckedChange={() => toggleDayOpen(selectedDay)}
							/>
						</div>
					</div>

					{isDayOpen(selectedDay) && (
						<>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label className="text-sm text-muted-foreground">
										Opens at
									</Label>
									<Input
										type="time"
										value={getDaySchedule(selectedDay)?.open || "09:00"}
										onChange={(e) => {
											const current = getDaySchedule(selectedDay);
											if (current) {
												updateDaySchedule(selectedDay, {
													...current,
													open: e.target.value,
												});
											}
										}}
										className="h-12"
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-sm text-muted-foreground">
										Closes at
									</Label>
									<Input
										type="time"
										value={getDaySchedule(selectedDay)?.close || "17:00"}
										onChange={(e) => {
											const current = getDaySchedule(selectedDay);
											if (current) {
												updateDaySchedule(selectedDay, {
													...current,
													close: e.target.value,
												});
											}
										}}
										className="h-12"
									/>
								</div>
							</div>

							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={applyToAllDays}
								className="w-full"
							>
								<span className="material-symbols-outlined text-lg mr-2">
									content_copy
								</span>
								Apply to all days
							</Button>
						</>
					)}

					{!isDayOpen(selectedDay) && (
						<p className="text-center text-muted-foreground text-sm py-4">
							Closed on this day
						</p>
					)}
				</div>

				{/* Quick Summary */}
				<div className="bg-surface-card/50 border border-surface-border rounded-lg p-3">
					<p className="text-xs font-medium text-muted-foreground mb-2">
						Weekly Schedule Summary
					</p>
					<div className="space-y-1">
						{DAYS_OF_WEEK.map((day) => {
							const schedule = getDaySchedule(day.key);
							return (
								<div
									key={day.key}
									className="flex justify-between text-xs items-center"
								>
									<span className="text-foreground font-medium w-20">
										{day.fullLabel}
									</span>
									{schedule ? (
										<span className="text-muted-foreground">
											{schedule.open} - {schedule.close}
										</span>
									) : (
										<span className="text-muted-foreground italic">Closed</span>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</section>

			<hr className="border-surface-border" />

			{/* Reservations Section */}
			<section className="space-y-4">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Reservations
				</Label>

				{/* Reservation Required Toggle */}
				<div className="bg-surface-card border border-surface-border rounded-xl p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-foreground font-medium">
								Reservations Required
							</p>
							<p className="text-muted-foreground text-sm">
								Enable for ticketed or booked entry
							</p>
						</div>
						<Controller
							name="reservationRequired"
							control={control}
							render={({ field }) => (
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							)}
						/>
					</div>
				</div>

				{/* Booking Platform URL */}
				{watch("reservationRequired") && (
					<div className="space-y-2">
						<Label className="text-muted-foreground text-sm font-medium">
							Booking Platform URL
						</Label>
						<div className="relative">
							<Input
								type="url"
								placeholder="e.g. OpenTable, Resy, Ticketmaster URL"
								{...register("reservationPlatform")}
								className="pr-12"
							/>
							<span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary material-symbols-outlined">
								calendar_month
							</span>
						</div>
					</div>
				)}
			</section>

			<hr className="border-surface-border" />

			{/* Payment Methods Section */}
			<section className="space-y-4">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Payment Methods
				</Label>

				<div className="flex flex-wrap gap-2">
					{PAYMENT_OPTIONS.map((option) => (
						<Button
							key={option.value}
							type="button"
							onClick={() => togglePayment(option.value)}
							variant={
								paymentOptions.includes(option.value) ? "default" : "outline"
							}
							className="rounded-full"
						>
							<span className="material-symbols-outlined text-lg mr-2">
								{option.icon}
							</span>
							{option.label}
							{paymentOptions.includes(option.value) && (
								<span className="material-symbols-outlined text-lg ml-2">
									check
								</span>
							)}
						</Button>
					))}
				</div>
			</section>

			<hr className="border-surface-border" />

			{/* Wait Time Section */}
			<section className="space-y-4">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Logistics
				</Label>

				<div className="space-y-2">
					<Label className="text-muted-foreground text-sm font-medium">
						Average Wait Time (minutes)
					</Label>
					<Input
						type="number"
						placeholder="e.g. 15"
						{...register("waitTimeEstimate", { valueAsNumber: true })}
						className="h-12"
					/>
					<p className="text-muted-foreground text-xs">
						Estimated wait time during peak hours
					</p>
				</div>
			</section>
		</div>
	);
}
