"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterLogisticsProps {
	dietaryOptions: string[];
	cuisine: string | null;
	parkingOptions: string[];
	onDietaryToggle: (val: string) => void;
	onCuisineChange: (val: string) => void;
	onParkingToggle: (val: string) => void;
}

export function FilterLogistics({
	dietaryOptions,
	cuisine,
	parkingOptions,
	onDietaryToggle,
	onCuisineChange,
	onParkingToggle,
}: FilterLogisticsProps) {
	return (
		<div className="space-y-3">
			<h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-2">
				Food & Facilities
			</h3>
			<Accordion
				type="multiple"
				defaultValue={["dietary"]}
				className="space-y-2.5"
			>
				<AccordionItem
					value="dietary"
					className="bg-card rounded-xl overflow-hidden border border-border"
				>
					<AccordionTrigger className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted transition-colors select-none hover:no-underline">
						<span className="text-xs font-bold text-foreground flex items-center gap-2">
							<span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-primary">
								<span className="material-symbols-outlined text-[16px]!">
									restaurant
								</span>
							</span>
							Dietary & Food
						</span>
					</AccordionTrigger>
					<AccordionContent className="px-3 pb-4 pt-1 border-t border-border bg-background/50">
						<div className="flex flex-wrap gap-1.5 mb-3 mt-2">
							{["Vegan", "Vegetarian", "Halal", "Gluten-Free", "Nut-Free"].map(
								(item) => {
									const val = item.toLowerCase().replace("-", "_");
									const isSelected = dietaryOptions.includes(val);
									return (
										<Button
											key={item}
											variant="outline"
											size="sm"
											onClick={() => onDietaryToggle(val)}
											className={cn(
												"h-auto py-1 px-2.5 rounded-full text-[10px] border transition-all",
												isSelected
													? "border-primary/50 bg-primary/10 text-primary shadow-sm hover:bg-primary/20 hover:text-primary hover:border-primary/60"
													: "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
											)}
										>
											{item}
										</Button>
									);
								}
							)}
						</div>
						<Select
							value={cuisine || undefined}
							onValueChange={onCuisineChange}
						>
							<SelectTrigger className="w-full h-10 bg-card border-border text-foreground text-xs rounded-lg px-3 appearance-none focus:ring-1 focus:ring-primary outline-none focus:border-primary/50 transition-all cursor-pointer hover:bg-muted">
								<SelectValue placeholder="Any Cuisine" />
							</SelectTrigger>
							<SelectContent className="bg-popover border-border text-popover-foreground">
								<SelectItem value="italian">Italian</SelectItem>
								<SelectItem value="japanese">Japanese</SelectItem>
								<SelectItem value="mexican">Mexican</SelectItem>
							</SelectContent>
						</Select>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem
					value="parking"
					className="bg-card rounded-xl overflow-hidden border border-border"
				>
					<AccordionTrigger className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted transition-colors select-none hover:no-underline">
						<span className="text-xs font-bold text-foreground flex items-center gap-2">
							<span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-primary">
								<span className="material-symbols-outlined text-[16px]!">
									local_parking
								</span>
							</span>
							Logistics & Parking
						</span>
					</AccordionTrigger>
					<AccordionContent className="px-3 pb-4 pt-2 border-t border-border space-y-3 bg-background/50">
						{[
							{ id: "car-parking", value: "car", label: "Car Parking" },
							{
								id: "motorcycle-parking",
								value: "motorcycle",
								label: "Motorcycle Parking",
							},
							{ id: "valet", value: "valet", label: "Valet Service" },
						].map((opt) => (
							<div key={opt.id} className="flex items-center gap-3 py-1">
								<Checkbox
									id={opt.id}
									checked={parkingOptions.includes(opt.value)}
									onCheckedChange={() => onParkingToggle(opt.value)}
								/>
								<label
									htmlFor={opt.id}
									className="text-sm text-foreground/80 cursor-pointer"
								>
									{opt.label}
								</label>
							</div>
						))}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}
