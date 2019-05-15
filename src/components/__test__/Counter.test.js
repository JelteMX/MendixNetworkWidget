import React from "react";
import renderer from "react-test-renderer";

import Counter from "../Counter";

describe("Counter Component Test Unit", () => {
  it("should render correctly", () => {
    const props = {dummyKey: "SOME_DUMMY_KEY"};
    const CounterSnapshot = renderer.create(<Counter {...props} />).toJSON();
    expect(CounterSnapshot).toMatchSnapshot();
  });
});
