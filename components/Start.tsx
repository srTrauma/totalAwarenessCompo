import Button from "./Button";

export default function Start() {
  return (
    <section className="flex flex-row items-center justify-between max-w-6xl mx-auto py-16 px-4">
      <div className="w-1/2 flex flex-col gap-8">
        <h1 className="text-4xl font-light tracking-tight">Total Awareness</h1>
        <p className="text-sm leading-relaxed text-gray-700">
          A comprehensive management platform providing real-time visibility
          across your organization. Streamline operations with our customizable,
          centralized solution designed for informed decision-making in today's
          dynamic business environment.
        </p>
        <div className="flex gap-4 mt-4">
          <Button Text="Get Started" href="/signup" />
          <Button Text="Learn More" blue href="/about" />
        </div>
      </div>
      <div className="w-1/2 pl-12">
        <img
          src="./imagesToGuapas/mainGroupLandingImage.png"
          alt="Total Awareness Platform"
          className="w-full object-contain rounded-md"
        />
      </div>
    </section>
  );
}
