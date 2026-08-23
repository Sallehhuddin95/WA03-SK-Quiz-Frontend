"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export function MatchingForm() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "jawapan_betul.pasangan",
  });

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Pasangan Padanan</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ kiri: "", kanan: "" })}
            disabled={fields.length >= 6}
          >
            <Plus className="mr-1 h-3 w-3" />
            Tambah Pasangan
          </Button>
        </div>

        {fields.length < 2 && (
          <p className="text-sm text-gray-500 mb-2">
            Sekurang-kurangnya 2 pasangan diperlukan.
          </p>
        )}

        <div className="grid gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-start gap-2 rounded-md border p-3"
            >
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={control}
                  name={`jawapan_betul.pasangan.${index}.kiri`}
                  render={({ field: inputField }) => (
                    <FormItem>
                      <FormLabel>Kiri</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`Item kiri ${index + 1}`}
                          {...inputField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`jawapan_betul.pasangan.${index}.kanan`}
                  render={({ field: inputField }) => (
                    <FormItem>
                      <FormLabel>Kanan</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`Item kanan ${index + 1}`}
                          {...inputField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length <= 2}
                className="mt-6 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
