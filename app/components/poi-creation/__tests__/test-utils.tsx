import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	poiFormSchema,
	POIFormData,
	defaultPOIFormValues,
} from "@/app/lib/schemas/poi-form";

interface TestWrapperProps {
	children: React.ReactNode;
	defaultValues?: Partial<POIFormData>;
}

// Mock Clerk provider for components that use ImageUpload
function MockClerkProvider({ children }: { children: React.ReactNode }) {
	return <div data-clerk-provider="mock">{children}</div>;
}

/**
 * Test wrapper component that provides FormProvider with POI form context
 */
function TestWrapper({ children, defaultValues }: TestWrapperProps) {
	const form = useForm<POIFormData>({
		resolver: zodResolver(poiFormSchema) as any,
		defaultValues: { ...defaultPOIFormValues, ...defaultValues },
		mode: "onChange",
	});

	return (
		<MockClerkProvider>
			<FormProvider {...form}>{children}</FormProvider>
		</MockClerkProvider>
	);
}

/**
 * Custom render function that wraps components with FormProvider
 */
export function renderWithForm(
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper"> & {
		defaultValues?: Partial<POIFormData>;
	}
) {
	const { defaultValues, ...renderOptions } = options || {};

	return render(ui, {
		wrapper: ({ children }) => (
			<TestWrapper defaultValues={defaultValues}>{children}</TestWrapper>
		),
		...renderOptions,
	});
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { renderWithForm as render };
