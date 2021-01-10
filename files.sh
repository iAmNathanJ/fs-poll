touch ./test-file.ts;

sleep 1;

echo "test" >> ./test-file.ts;

sleep 1;

rm ./test-file.ts;
