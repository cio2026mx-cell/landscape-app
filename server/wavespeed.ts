import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";

export const wavespeedRouter = router({
  chat: publicProcedure
    .input(z.object({
      message: z.string().min(1),
      systemPrompt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: input.systemPrompt || "Eres Wavespeed, un asesor experto en paisajismo y diseño de jardines." },
            { role: "user", content: input.message },
          ],
        });
        const content = response.choices[0]?.message?.content;
        return { reply: typeof content === "string" ? content : "Error", success: true };
      } catch (error) {
        return { reply: "Error al procesar", success: false, error: error instanceof Error ? error.message : "Unknown" };
      }
    }),
});
